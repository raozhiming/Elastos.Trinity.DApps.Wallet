import { SubWallet, SerializedSubWallet  } from './SubWallet';
import { WalletAccount, WalletAccountType } from './WalletAccount';
import { WalletManager } from '../services/wallet.service';
import { StandardSubWallet } from './StandardSubWallet';
import { ERC20SubWallet } from './ERC20SubWallet';
import { Coin, CoinID, CoinType } from './Coin';

export type WalletID = string;

export enum StandardCoinName {
    ELA = 'ELA',
    IDChain = 'IDChain',
    ETHChain = 'ETHChain' // TODO: make sure this is the right name for the SPVSDK
}

export namespace StandardCoinName {
    export function fromCoinID(coinID: CoinID): StandardCoinName {
        console.log("debug fromCoinID ", coinID)
        return StandardCoinName[coinID];
    }
}

export class ExtendedWalletInfo {
    /** User defined wallet name */
    name: string;
    /** List of serialized subwallets added earlier to this master wallet */
    subWallets: SerializedSubWallet[] = [];
}

class SubWalletBuilder {
    /**
     * Newly created wallet, base on a coin type.
     */
    static newFromCoin(masterWallet: MasterWallet, coin: Coin): Promise<SubWallet> {
        console.log("Creating new subwallet using coin", coin);

        switch (coin.getType()) {
            case CoinType.STANDARD:
                return StandardSubWallet.newFromCoin(masterWallet, coin);
            case CoinType.ERC20: 
                return ERC20SubWallet.newFromCoin(masterWallet, coin);
            default:
                console.warn("Unsupported coin type", coin.getType());
                break;
        }
    }

    /**
     * Restored wallet from local storage info.
     */
    static newFromSerializedSubWallet(masterWallet: MasterWallet, serializedSubWallet: SerializedSubWallet): SubWallet {
        switch (serializedSubWallet.type) {
            case CoinType.STANDARD:
                return StandardSubWallet.newFromSerializedSubWallet(masterWallet, serializedSubWallet);
            case CoinType.ERC20: 
                return ERC20SubWallet.newFromSerializedSubWallet(masterWallet, serializedSubWallet);
            default:
                console.warn("Unsupported subwallet type", serializedSubWallet.type);
                break;
        }
    }
}

export class MasterWallet {
    public id: string = null;
    public name: string = null;

    public subWallets: {
        [k: string]: SubWallet
    } = {};

    public account: WalletAccount = {
        Type: WalletAccountType.STANDARD,
        singleAddress: false
    };

    constructor(public walletManager: WalletManager, id: string, name?: string) {
        this.id = id;
        this.name = name || "";
    }

    public getExtendedWalletInfo(): ExtendedWalletInfo {
        let extendedInfo = new ExtendedWalletInfo();

        extendedInfo.name = this.name;
        for (let subWallet of Object.values(this.subWallets)) {
            extendedInfo.subWallets.push(subWallet.toSerializedSubWallet());
        }
        
        return extendedInfo;
    }

    /**
     * Appends extended info from the local storage to this wallet model.
     * This includes everything the SPV plugin could not save and that we saved in our local 
     * storage instead.
     */
    public async populateWithExtendedInfo(extendedInfo: ExtendedWalletInfo) {
        console.log("Populating master wallet with extended info", this.id);

        // Retrieve wallet account type
        this.account = await this.walletManager.spvBridge.getMasterWalletBasicInfo(this.id);

        // In case of newly created wallet we don't have extended info from local storag yet,
        // which is normal.
        if (extendedInfo) {
            this.name = extendedInfo.name;
            
            this.subWallets = {};
            for (let serializedSubWallet of extendedInfo.subWallets) {
                let subWallet = SubWalletBuilder.newFromSerializedSubWallet(this, serializedSubWallet);
                if (subWallet) {
                    this.subWallets[serializedSubWallet.id] = subWallet;
                }
            }
        }
    }

    public getBalance(): number {
        // Sum all subwallets balances to get the master wallet total balance
        let balance = 0;
        for (let subWallet of Object.values(this.subWallets)) {
            balance += subWallet.balance;
        }
        return balance;
    }

    public updateSyncProgress(chainId: StandardCoinName, progress: number, lastBlockTime: number) {
        this.subWallets[chainId].updateSyncProgress(progress, lastBlockTime);
    }

    public startSubWalletsSync() {
        console.log("SubWallets sync is starting");

        for (let subWallet of Object.values(this.subWallets)) {
            // Only sync SPV SDK wallets
            if (subWallet.type == CoinType.STANDARD)
                this.walletManager.spvBridge.syncStart(this.id, subWallet.id);
        }
    }

    public stopSubWalletsSync() {
        console.log("SubWallets sync is stopping");

        for (let subWallet of Object.values(this.subWallets)) {
            // Only sync SPV SDK wallets
            if (subWallet.type == CoinType.STANDARD) {
                (subWallet as StandardSubWallet).stopSyncing();
            }
        }
    }

    public getSubWalletBalance(coinId: CoinID): number {
        return this.subWallets[coinId].balance;
    }

    public hasSubWallet(coinId: CoinID): boolean {
        return coinId in this.subWallets;
    }

    /**
     * Returns the list of all subwallets except the excluded one.
     */
    public subWalletsWithExcludedCoin(excludedCoinName: StandardCoinName): SubWallet[] {
        return Object.values(this.subWallets).filter((sw)=>{
            return sw.id != excludedCoinName;
        })
    }

    /**
     * Adds a new subwallet to this master wallet, based on a given coin type.
     */
    public async createSubWallet(coin: Coin) {
        this.subWallets[coin.getID()] = await SubWalletBuilder.newFromCoin(this, coin);

        await this.walletManager.saveMasterWallet(this);
    }

    /**
     * Removes a subwallet (coin - ex: ela, idchain) from the given wallet.
     */
    public async destroySubWallet(coinId: CoinID) {
        let subWallet = this.subWallets[coinId];
        subWallet.destroy();
        
        // Delete the subwallet from out local model.
        delete this.subWallets[coinId];

        await this.walletManager.saveMasterWallet(this);
    }

    /**
     * Convenient method to access subwallets as an array.
     */
    public getSubWallets(): SubWallet[] {
        return Object.values(this.subWallets);
    }

    public getSubWallet(id: CoinID): SubWallet {
        return this.subWallets[id];
    }
}
