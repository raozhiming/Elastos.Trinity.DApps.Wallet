import { SubWallet } from './SubWallet';
import { WalletAccount, WalletAccountType } from './WalletAccount';
import { SPVWalletMessage } from './SPVWalletPluginBridge';
import { WalletManager } from '../services/wallet.service';
import { Util } from './Util';

export type WalletID = string;

export enum CoinName {
    ELA = 'ELA',
    IDCHAIN = 'IDChain'
}

export type ExtendedWalletInfo = {
    name: string;
    //enabledCoins: CoinName[];
}

export class MasterWallet {
    public id: string = null;
    public name: string = null;
    
    public subWallets: {
        [k: string]: SubWallet
    } = {};

    public account: WalletAccount = {
        Type: WalletAccountType.STANDARD 
    };
    public totalBalance: number = -1;

    constructor(public walletManager: WalletManager, id: string, name?: string) {
        this.id = id;
        this.name = name || "";
        this.subWallets = {
            ELA: new SubWallet(this, CoinName.ELA)
        }
    }

    public async populateMasterWalletSPVInfo() {
        console.log("Retrieving SPV wallet info for wallet:", this.id);

        // Retrieve wallet account type
        this.account = await this.walletManager.spvBridge.getMasterWalletBasicInfo(this.id);

        // Populate sub wallet info for this master wallet
        await this.populateAllSubWallets(this.id);
    }

    private async populateAllSubWallets(masterId) {
        console.log("Getting all subwallets for wallet ", masterId);

        let chainIds = await this.walletManager.spvBridge.getAllSubWallets(masterId);

        for (let chainId of chainIds) {
            await this.populateSubWallet(chainId);
        }
    }

    public async populateSubWallet(chainId: CoinName) {    
        console.log("Populating subwallet with chain id "+chainId);

        this.subWallets[chainId] = new SubWallet(this, chainId);
        await this.walletManager.saveMasterWallets();
       
        this.walletManager.registerSubWalletListener(this.id, chainId);

        await this.updateWalletBalance(chainId);

        this.walletManager.spvBridge.syncStart(this.id, chainId);
    }

    public async updateWalletBalance(chainId: string) {
        // Update wallet balance for the subwallet that has just changed
        await this.subWallets[chainId].updateWalletBalance();

        // Sum all subwallets balances to refresh the master wallet total balance
        let totalBalance = 0;
        for (let subWallet of Object.values(this.subWallets)) {
            totalBalance += subWallet.balance;
        }
        this.totalBalance = totalBalance;
    }

    public setProgress(chainId: CoinName, progress: number, lastBlockTime: number) {
        this.subWallets[chainId].setProgress(progress, lastBlockTime);
    }

    public startSubWalletsSync() {
        console.log("SubWallets sync is starting");

        for (let subWallet of Object.values(this.subWallets)) {
            console.log("syncstart")
            this.walletManager.spvBridge.syncStart(this.id, subWallet.id);
        }
    }

    public stopSubWalletsSync() {
        console.log("SubWallets sync is stopping");

        for (let subWallet of Object.values(this.subWallets)) {
            this.walletManager.spvBridge.syncStop(this.id, subWallet.id);
        }
    }

    public getSubWalletBalance(chainId: CoinName): number {
        return this.subWallets[chainId].balance;
    }

    public hasSubWallet(chainId: CoinName): boolean {
        return chainId in this.subWallets;
    }

    /**
     * Returns the list of all subwallets except the excluded one.
     */
    public subWalletsWithExcludedCoin(excludedCoinName: CoinName): SubWallet[] {
        return Object.values(this.subWallets).filter((sw)=>{
            return sw.id != excludedCoinName;
        })
    }

    /**
     * Convenient method to access subwallets as an array.
     */
    public getSubWallets(): SubWallet[] {
        return Object.values(this.subWallets);
    }
}
