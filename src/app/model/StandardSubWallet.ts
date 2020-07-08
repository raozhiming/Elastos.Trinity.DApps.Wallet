import { MasterWallet, StandardCoinName } from './MasterWallet';
import { SubWallet, SerializedSubWallet } from './SubWallet';
import { CoinType, Coin } from './Coin';

export class StandardSubWallet extends SubWallet {
    constructor(masterWallet: MasterWallet, id: StandardCoinName) {
        super(masterWallet, id, CoinType.STANDARD);

        this.initialize();
    }

    private initialize() {
        this.masterWallet.walletManager.registerSubWalletListener(this.masterWallet.id, this.id as StandardCoinName);

        this.updateBalance();

        this.masterWallet.walletManager.spvBridge.syncStart(this.masterWallet.id, this.id);
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
        let subWallet = new StandardSubWallet(masterWallet, serializedSubWallet.id);
        Object.assign(subWallet, serializedSubWallet);
        return subWallet;
    }

    public async destroy() {
        await this.stopSyncing();
        await this.masterWallet.walletManager.spvBridge.destroySubWallet(this.masterWallet.id, this.id);

        super.destroy();
    }

    /**
     * Stops any on going synchronization.
     */
    public async stopSyncing(): Promise<void> {
        return this.masterWallet.walletManager.spvBridge.syncStop(this.masterWallet.id, this.id);
    }
}