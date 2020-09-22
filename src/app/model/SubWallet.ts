import { MasterWallet } from './MasterWallet';
import { Events } from '@ionic/angular';
import { CoinType, CoinID, StandardCoinName } from './Coin';
import { AllTransactions } from './Transaction';
import { Transfer } from '../services/cointransfer.service';
import BigNumber from 'bignumber.js';

/**
 * Subwallet representation ready to save to local storage for persistance.
 */
export class SerializedSubWallet {
    public type: CoinType = null;
    public id: StandardCoinName = null;
    public balance: BigNumber = new BigNumber(0);
    public lastBlockTime: string = null;
    public timestamp: number = -1;
    public progress: number = 0;
}

export abstract class SubWallet {
    public id: CoinID = null;
    public balance: BigNumber = new BigNumber(0); // raw balance. Will be sELA for standard wallets, or a token number for ERC20 coins.
    public lastBlockTime: string = null;
    public timestamp: number = -1;
    public progress: number = 0;
    public balanceByRPC: BigNumber = new BigNumber(0);
    public timestampRPC: number = 0;

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
    public async destroy() {}

    /** Create a new wallet address for receiving payments. */
    public abstract createAddress(): Promise<string>;
    public abstract getFriendlyName(): string;
    public abstract getDisplayTokenName(): string;
    public abstract async updateBalance();
    /** Balance using a human friendly unit. For example, standard wallets have a balance in sELA but getDisplayBalance() returns the amount in ELA */
    public abstract getDisplayBalance(): BigNumber;
    public abstract isBalanceEnough(amount: BigNumber): boolean;
    public abstract async getTransactions(startIndex: number): Promise<AllTransactions>;
    public abstract async createPaymentTransaction(toAddress: string, amount: string, memo: string): Promise<string>;
    public abstract async signAndSendRawTransaction(transaction: string, transfer: Transfer): Promise<void>;
}
