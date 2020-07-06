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

    public async populateMasterWalletSPVInfo(isAdd = false) {
        console.log("Retrieving SPV wallet info for wallet:", this.id);

        // Retrieve wallet account type
        this.account = await this.walletManager.spvBridge.getMasterWalletBasicInfo(this.id);

        // Populate sub wallet info for this master wallet
        await this.populateAllSubWallets(this.id, isAdd);
    }

    private async populateAllSubWallets(masterId, isAdd = false) {
        console.log("Getting all subwallets for wallet:", masterId, isAdd);

        let chainIds = await this.walletManager.spvBridge.getAllSubWallets(masterId);

        for (let chainId of chainIds) {
            this.addSubWallet(masterId, chainId);
        }

        if (isAdd) {
            this.saveInfos();
            this.setCurMasterId(masterId);
            this.native.setRootRouter("/tabs");
        } else {
            let currentMasterId = this.masterIdFromStorage;
            // Choose the first wallet if switch Network(MainNet,TestNet).
            if (this.masterList.indexOf(currentMasterId) === -1) {
                currentMasterId = this.masterList[0];
            }

            if (currentMasterId === '-1') {
                this.curMasterId = this.masterList[0];
            }

            if (masterId === currentMasterId) {
                this.setCurMasterId(masterId);
                this.native.setRootRouter("/tabs");
            }
        }
    }

    public async addSubWallet(masterId: WalletID, chainId: CoinName) {        
        if (!this.subWallets[chainId]) {
            this.subWallets[chainId] = new SubWallet(this, chainId);
        } else {
            if (this.progress && this.progress[masterId] && this.progress[masterId][chainId]) {
                const lastblocktime = this.progress[masterId][chainId].lastblocktime;
                if (lastblocktime) {
                    this.subWallets[chainId].lastblocktime = lastblocktime;
                    this.subWallets[chainId].timestamp = 0;
                }
            }
        }

        this.walletManager.spvBridge.registerWalletListener(masterId, chainId, (ret: SPVWalletMessage)=>{
            this.zone.run(() => {
                this.handleSubWalletCallback(ret);
            });
        });

        this.updateWalletBalance(chainId);
    }

    public async updateWalletBalance(chainId: string) {
        // Update wallet balance for the subwallet that has just changed
        this.subWallets[chainId].updateWalletBalance();

        // Sum all subwallets balances to refresh the master wallet total balance
        let totalBalance = 0;
        for (let subWallet of Object.values(this.subWallets)) {
            totalBalance += subWallet.balance;
        }
        this.totalBalance = totalBalance;
    }

    public setProgress(chainId: CoinName, progress: number, lastBlockTime: string) {
        this.subWallets[chainId].setProgress(progress, lastBlockTime);
    }
}
