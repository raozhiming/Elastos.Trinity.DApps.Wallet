import { StandardSubWallet } from './StandardSubWallet';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import { Transaction, TransactionDirection, TransactionInfo, TransactionType } from '../Transaction';
import { Config } from 'src/app/config/Config';
import { TranslateService } from '@ngx-translate/core';
import { StandardCoinName } from '../Coin';
import { MasterWallet } from './MasterWallet';

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
}