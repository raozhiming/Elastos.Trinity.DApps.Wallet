import { StandardSubWallet } from './StandardSubWallet';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import { EthTransaction, RawTransactionType, Transaction, TransactionDirection, TransactionInfo, TransactionType } from '../Transaction';
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

    public async createPaymentTransaction(toAddress: string, amount: string, memo: string): Promise<string> {
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