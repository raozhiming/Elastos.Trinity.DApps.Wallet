import { MasterWallet, CoinName } from './MasterWallet';
import { Util } from './Util';
import { Events } from '@ionic/angular';

export class SubWallet {
    public id: CoinName = null;
    public balance: number = 0;
    public lastBlockTime: string = null;
    public timestamp: number = -1;
    public progress: number = 0;

    private events: Events;

    constructor(private masterWallet: MasterWallet, id: CoinName) {
        this.id = id;
        this.events = this.masterWallet.walletManager.events;
    }

    public async updateWalletBalance() {
        // Get the current balance from the wallet plugin.
        let balanceStr = await this.masterWallet.walletManager.spvBridge.getBalance(this.masterWallet.id, this.id);

        // Balance in SELA
        this.balance = parseInt(balanceStr, 10);
    }

    /*
    * Updates current SPV synchonization progress information for this coin.
    */
    public setProgress(progress: number, lastBlockTime: number) {
        const userReadableDateTime = Util.dateFormat(new Date(lastBlockTime * 1000), 'yyyy-MM-dd HH:mm:ss');

        this.progress = progress;
        this.lastBlockTime = userReadableDateTime;

        const curTimestampMs = (new Date()).getTime();
        if (curTimestampMs - this.timestamp > 5000) { // 5s
            this.events.publish(this.id + ':syncprogress', this.id);
            this.timestamp = curTimestampMs;
        }

        if (progress === 100) {
            this.masterWallet.walletManager.sendSyncCompletedNotification(this.id);
            this.events.publish(this.id + ':synccompleted', this.id);
        }
    }
}