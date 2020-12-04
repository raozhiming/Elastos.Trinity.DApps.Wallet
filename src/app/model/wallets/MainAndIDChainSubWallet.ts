import { StandardSubWallet } from './StandardSubWallet';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import { Transaction, TransactionDirection, TransactionInfo, TransactionType } from '../Transaction';
import { Config } from 'src/app/config/Config';
import { TranslateService } from '@ngx-translate/core';
import { StandardCoinName } from '../Coin';
import { MasterWallet } from './MasterWallet';
import { JsonRPCService } from 'src/app/services/jsonrpc.service';

/**
 * Specialized standard sub wallet that shares Mainchain (ELA) and ID chain code.
 * Most code between these 2 chains is common, while ETH is quite different. This is the reason why this
 * specialized class exists.
 */
export class MainAndIDChainSubWallet extends StandardSubWallet {
    constructor(masterWallet: MasterWallet, id: StandardCoinName) {
        super(masterWallet, id);
    }

    public async getTransactionInfo(transaction: Transaction, translate: TranslateService): Promise<TransactionInfo> {
        let transactionInfo = await super.getTransactionInfo(transaction, translate);

        transactionInfo.amount = new BigNumber(transaction.Amount, 10).dividedBy(Config.SELAAsBigNumber);
        transactionInfo.txId = transaction.TxHash;
        transactionInfo.confirmStatus = transaction.ConfirmStatus;

        if (transaction.Direction === TransactionDirection.RECEIVED) {
            transactionInfo.type = TransactionType.RECEIVED;
            transactionInfo.symbol = '+';
        } else if (transaction.Direction === TransactionDirection.SENT) {
            transactionInfo.type = TransactionType.SENT;
            transactionInfo.symbol = '-';
        } else if (transaction.Direction === TransactionDirection.MOVED) {
            transactionInfo.type = TransactionType.TRANSFER;
            transactionInfo.symbol = '';
        }

        return transactionInfo;
    }

    public async updateBalance() {
        // if the balance form spvsdk is newer, then use it.
        if (!this.lastBlockTime || (moment(this.lastBlockTime).valueOf() > this.timestampRPC)) {
            // Get the current balance from the wallet plugin.
            let balanceStr = await this.masterWallet.walletManager.spvBridge.getBalance(this.masterWallet.id, this.id);

            // Balance in SELA
            this.balance = new BigNumber(balanceStr, 10);
        }
    }

    /**
     * Check whether there are any unconfirmed transactions
     * For dpos vote transaction
     */
    public async hasPendingBalance() {
        const jsonInfo = await this.masterWallet.walletManager.spvBridge.getBalanceInfo(this.masterWallet.id, this.id);
        const balanceInfoArray = JSON.parse(jsonInfo);
        for (const balanceInfo of balanceInfoArray) {
            if ((balanceInfo.Summary.SpendingBalance !== '0') ||
                (balanceInfo.Summary.PendingBalance !== '0')) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check whether the available balance is enough.
     * @param amount unit is SELA
     */
    public async isAvailableBalanceEnough(amount: BigNumber) {
        const jsonInfo = await this.masterWallet.walletManager.spvBridge.getBalanceInfo(this.masterWallet.id, this.id);
        const balanceInfoArray = JSON.parse(jsonInfo);
        let availableBalance = new BigNumber(0);
        for (const balanceInfo of balanceInfoArray) {
            if (balanceInfo.Summary.Balance !== '0') {
                let balanceOfasset = new BigNumber(balanceInfo.Summary.Balance);
                if (balanceInfo.Summary.SpendingBalance !== '0') {
                    balanceOfasset = balanceOfasset.minus(new BigNumber(balanceInfo.Summary.SpendingBalance));
                }
                if (balanceInfo.Summary.PendingBalance !== '0') {
                    balanceOfasset = balanceOfasset.minus(new BigNumber(balanceInfo.Summary.PendingBalance));
                }
                if (balanceInfo.Summary.LockedBalance !== '0') {
                    balanceOfasset = balanceOfasset.minus(new BigNumber(balanceInfo.Summary.LockedBalance));
                }
                // DepositBalance

                availableBalance = availableBalance.plus(balanceOfasset);
                if (availableBalance.gt(amount)) {
                    return true;
                }
            }
        }
        return false;
    }

    public async createPaymentTransaction(toAddress: string, amount: string, memo: string = ""): Promise<string> {
        return this.masterWallet.walletManager.spvBridge.createTransaction(
            this.masterWallet.id,
            this.id, // From subwallet id
            '', // From address, not necessary
            toAddress,
            amount,
            memo // User input memo
        );
    }

    public async createWithdrawTransaction(toAddress: string, toAmount: number, memo: string): Promise<string> {
        return this.masterWallet.walletManager.spvBridge.createWithdrawTransaction(
            this.masterWallet.id,
            this.id, // From subwallet id
            '',
            toAmount.toString(),
            toAddress,
            memo
        );
    }

    async getBalanceByRPC(jsonRPCService: JsonRPCService): Promise<BigNumber> {
        console.log('TIMETEST getBalanceByRPC start:', this.id);

        // If the balance of 5 consecutive request is 0, then end the query.(100 addresses)
        let maxRequestTimesOfGetEmptyBalance = 5;
        let requestTimesOfGetEmptyBalance = 0;
        // In order to calculate blanks
        let requestAddressCountOfInternal = 1;
        let requestAddressCountOfExternal = 1;

        let startIndex = 0;
        let totalBalance = new BigNumber(0);
        let totalRequestCount = 0;

        console.log('Internal address');

        // internal address
        let addressArray = null;
        do {
            addressArray = await this.masterWallet.walletManager.spvBridge.getAllAddresses(this.masterWallet.id, this.id, startIndex, true);
            if (addressArray.Addresses.length === 0) {
                requestAddressCountOfInternal = startIndex;
                totalRequestCount = startIndex;
                break;
            }
            startIndex += addressArray.Addresses.length;

            try {
                const balance = await jsonRPCService.getBalanceByAddress(this.id as StandardCoinName, addressArray.Addresses);
                totalBalance = totalBalance.plus(balance);

                if (balance.lte(0)) {
                    requestTimesOfGetEmptyBalance++;
                    if (requestTimesOfGetEmptyBalance >= maxRequestTimesOfGetEmptyBalance) {
                        requestAddressCountOfInternal = startIndex;
                        totalRequestCount = startIndex;
                        break;
                    }
                } else {
                    requestTimesOfGetEmptyBalance = 0;
                }
            } catch (e) {
                console.log('jsonRPCService.getBalanceByAddress exception:', e);
                throw e;
            }
        } while (!this.masterWallet.account.SingleAddress);

        console.log('External address');

        if (!this.masterWallet.account.SingleAddress) {
            // external address for user
            const currentReceiveAddress = await this.masterWallet.walletManager.spvBridge.createAddress(this.masterWallet.id, this.id);
            let currentReceiveAddressIndex = -1;
            let startCheckBlanks = false;

            maxRequestTimesOfGetEmptyBalance = 1; // is 1 ok for external?
            startIndex = 0;
            while (true) {
                const addressArray = await this.masterWallet.walletManager.spvBridge.getAllAddresses(this.masterWallet.id, this.id, startIndex, false);
                if (addressArray.Addresses.length === 0) {
                    requestAddressCountOfExternal = startIndex;
                    totalRequestCount += startIndex;
                    break;
                }
                startIndex += addressArray.Addresses.length;
                if (currentReceiveAddressIndex === -1) {
                    currentReceiveAddressIndex = addressArray.Addresses.findIndex((address) => (address === currentReceiveAddress));
                    if (currentReceiveAddressIndex !== -1) {
                        currentReceiveAddressIndex += startIndex;
                        startCheckBlanks = true;
                    }
                }

                try {
                    const balance = await jsonRPCService.getBalanceByAddress(this.id as StandardCoinName, addressArray.Addresses);
                    totalBalance = totalBalance.plus(balance);

                    if (startCheckBlanks) {
                        if (balance.lte(0)) {
                            requestTimesOfGetEmptyBalance++;
                            if (requestTimesOfGetEmptyBalance >= maxRequestTimesOfGetEmptyBalance) {
                                requestAddressCountOfExternal = startIndex;
                                totalRequestCount += startIndex;
                                break;
                            }
                        } else {
                            requestTimesOfGetEmptyBalance = 0;
                        }
                    }
                } catch (e) {
                    console.log('jsonRPCService.getBalanceByAddress exception:', e);
                    throw e;
                }
            }
        }

        console.log('TIMETEST getBalanceByRPC ', this.id, ' end');
        console.log('getBalanceByRPC totalBalance:', totalBalance,
                ' totalRequestCount:', totalRequestCount,
                ' requestAddressCountOfInternal:', requestAddressCountOfInternal,
                ' requestAddressCountOfExternal:', requestAddressCountOfExternal);

        return totalBalance;
    }
}
