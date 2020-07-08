import { MasterWallet } from './MasterWallet';
import { SubWallet, SerializedSubWallet } from './SubWallet';
import { CoinType, CoinID, Coin } from './Coin';

export class ERC20SubWallet extends SubWallet {
    constructor(masterWallet: MasterWallet, id: CoinID) {
        super(masterWallet, id, CoinType.ERC20);
    }

    public static newFromCoin(masterWallet: MasterWallet, coin: Coin): Promise<ERC20SubWallet> {
        let subWallet = new ERC20SubWallet(masterWallet, coin.getID());
        return Promise.resolve(subWallet);
    }

    public static newFromSerializedSubWallet(masterWallet: MasterWallet, serializedSubWallet: SerializedSubWallet): ERC20SubWallet {
        let subWallet = new ERC20SubWallet(masterWallet, serializedSubWallet.id);
        Object.assign(subWallet, serializedSubWallet);
        return subWallet;
    }
}