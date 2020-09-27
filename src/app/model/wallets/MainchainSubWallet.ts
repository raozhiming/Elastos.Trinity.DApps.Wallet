import { StandardSubWallet } from './StandardSubWallet';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import { EthTransaction, RawTransactionType, Transaction, TransactionDirection, TransactionInfo, TransactionType } from '../Transaction';
import { Config } from 'src/app/config/Config';
import { TranslateService } from '@ngx-translate/core';
import { StandardCoinName } from '../Coin';
import { MasterWallet } from './MasterWallet';
import { MainAndIDChainSubWallet } from './MainAndIDChainSubWallet';

/**
 * Specialized standard sub wallet for ELA mainchain.
 */
export class MainchainSubWallet extends MainAndIDChainSubWallet {
    constructor(masterWallet: MasterWallet) {
        super(masterWallet, StandardCoinName.ELA);
    }

    protected async getTransactionName(transaction: Transaction, translate: TranslateService): Promise<string> {
        if (transaction.Direction === TransactionDirection.MOVED) {
            const isVote = await this.isVoteTransaction(transaction.TxHash);
            if (isVote) {
                return translate.instant("coin-op-vote");
            }
        }

        return super.getTransactionName(transaction, translate);
    }
}