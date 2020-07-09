import { MasterWallet } from './MasterWallet';
import { Util } from './Util';
import { Events } from '@ionic/angular';
import { CoinType, CoinID, StandardCoinName } from './Coin';
import { AllTransactions } from './Transaction';

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

export abstract class SubWallet {
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

    public abstract async updateBalance();
    public abstract async getTransactions(startIndex: number): Promise<AllTransactions>;
}