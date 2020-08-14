import { MasterWallet } from './MasterWallet';
import { SubWallet, SerializedSubWallet } from './SubWallet';
import { CoinType, Coin, StandardCoinName } from './Coin';
import { Util } from './Util';
import { AllTransactions } from './Transaction';
import * as moment from 'moment';

export class StandardSubWallet extends SubWallet {
    constructor(masterWallet: MasterWallet, id: StandardCoinName) {
        super(masterWallet, id, CoinType.STANDARD);

        this.initialize();
    }

    private initialize() {
        // this.masterWallet.walletManager.registerSubWalletListener();
        this.initLastBlockInfo();
        this.updateBalance();
    }

    public static async newFromCoin(masterWallet: MasterWallet, coin: Coin): Promise<StandardSubWallet> {
        let coinName = StandardCoinName.fromCoinID(coin.getID());

        // Create the subwallet in the SPV SDK first, before creating it in our model, as further function
        // calls need the SPV entry to be ready.
        await masterWallet.walletManager.spvBridge.createSubWallet(masterWallet.id, coinName);

        let subWallet = new StandardSubWallet(masterWallet, coinName);

        return subWallet;
    }

    public static newFromSerializedSubWallet(masterWallet: MasterWallet, serializedSubWallet: SerializedSubWallet): StandardSubWallet {
        console.log("Initializing standard subwallet from serialized sub wallet", serializedSubWallet);
        let subWallet = new StandardSubWallet(masterWallet, serializedSubWallet.id);
        Object.assign(subWallet, serializedSubWallet);
        return subWallet;
    }

    public async destroy() {
        this.masterWallet.walletManager.stopSubWalletSync(this.masterWallet.id, this.id as StandardCoinName);
        await this.masterWallet.walletManager.spvBridge.destroySubWallet(this.masterWallet.id, this.id);

        super.destroy();
    }

    /**
     * Get the last block info from the local data.
     */
    public async initLastBlockInfo() {
        // Get the last block info from the wallet plugin.
        const blockInfo = await this.masterWallet.walletManager.spvBridge.getLastBlockInfo(this.masterWallet.id, this.id);

        if (blockInfo) this.updateSyncProgress(0, blockInfo.Timestamp);
    }

    public getFriendlyName(): string {
        return this.masterWallet.coinService.getCoinByID(this.id).getDescription();
    }

    public getDisplayTokenName(): string {
        return this.masterWallet.coinService.getCoinByID(this.id).getName();
    }

    /**
     * Requests a wallet to update its balance. Usually called when we receive an event from the SPV SDK,
     * saying that a new balance amount is available.
     */
    public async updateBalance() {
        // if the balance form spvsdk is newer, then use it.
        if (!this.lastBlockTime || (moment(this.lastBlockTime).valueOf() > this.timestampRPC)) {
            // Get the current balance from the wallet plugin.
            let balanceStr = await this.masterWallet.walletManager.spvBridge.getBalance(this.masterWallet.id, this.id);

            // Balance in SELA
            this.balance = parseInt(balanceStr, 10);
        }
    }

    public async getTransactions(startIndex: number): Promise<AllTransactions> {
        let allTransactions = await this.masterWallet.walletManager.spvBridge.getAllTransactions(this.masterWallet.id, this.id, startIndex, '');
        return allTransactions;
    }

   /*
    * Updates current SPV synchonization progress information for this coin.
    */
   public updateSyncProgress(progress: number, lastBlockTime: number) {
        const userReadableDateTime = Util.dateFormat(new Date(lastBlockTime * 1000), 'YYYY-MM-DD HH:mm:ss');
        this.progress = progress;
        this.lastBlockTime = userReadableDateTime;

        console.log("Standard subwallet "+this.id+" got update sync progress request. Progress = "+progress);

        const curTimestampMs = (new Date()).getTime();
        if (curTimestampMs - this.timestamp > 5000) { // 5s
            this.masterWallet.walletManager.events.publish(this.id + ':syncprogress', this.id);
            this.timestamp = curTimestampMs;
        }

        if (progress === 100) {
            this.masterWallet.walletManager.events.publish(this.id + ':synccompleted', this.id);
        }
    }
}
