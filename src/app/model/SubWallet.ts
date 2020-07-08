import { MasterWallet, StandardCoinName } from './MasterWallet';
import { Util } from './Util';
import { Events } from '@ionic/angular';
import { CoinType, CoinID } from './Coin';

/**
 * Subwallet representation ready to save to local storage for persistance.
 */
export class SerializedSubWallet {
    public type: CoinType = null;
    public id: StandardCoinName = null;
    public balance: number = 0;
    public lastBlockTime: string = null;
    public timestamp: number = -1;
    public progress: number = 0;
}

export class SubWallet {
    public id: CoinID = null;
    public balance: number = 0;
    public lastBlockTime: string = null;
    public timestamp: number = -1;
    public progress: number = 0;

    private events: Events;

    constructor(protected masterWallet: MasterWallet, id: CoinID, public type: CoinType) {
        this.id = id;
        this.events = this.masterWallet.walletManager.events;
    }

    public toSerializedSubWallet(): SerializedSubWallet {
        let serializedSubWallet = new SerializedSubWallet();

        // Serialize only fields that we are willing to have in the serialized output.
        for(var key in serializedSubWallet) {
            serializedSubWallet[key] = this[key];
        }

        return serializedSubWallet;
    }

    /**
     * Inheritable method to do some cleanup when a subwallet is removed/destroyed from a master wallet
     */
    public async destroy() {
    }

    /**
     * Requests a wallet to update its balance. Usually called when we receive an event from the SPV SDK,
     * saying that a new balance amount is available.
     */
    public async updateBalance() {
        // Get the current balance from the wallet plugin.
        let balanceStr = await this.masterWallet.walletManager.spvBridge.getBalance(this.masterWallet.id, this.id);

        // Balance in SELA
        this.balance = parseInt(balanceStr, 10);
    }

    /*
    * Updates current SPV synchonization progress information for this coin.
    */
    public updateSyncProgress(progress: number, lastBlockTime: number) {
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