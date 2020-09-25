import { StandardSubWallet } from './StandardSubWallet';
import moment from 'moment';
import BigNumber from 'bignumber.js';

/**
 * Specialized standard sub wallet for ELA mainchain.
 */
export class MainchainSubWallet extends StandardSubWallet {
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