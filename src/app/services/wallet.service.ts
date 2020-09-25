/*
 * Copyright (c) 2019 Elastos Foundation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Events, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';

import { SPVWalletPluginBridge, SPVWalletMessage, TxPublishedResult, ETHSCEventType, ETHSCEvent, ETHSCEventAction } from '../model/SPVWalletPluginBridge';
import { MasterWallet, WalletID } from '../model/MasterWallet';
import { StandardCoinName, CoinType, StandardCoin } from '../model/Coin';
import { WalletAccountType, WalletAccount } from '../model/WalletAccount';
import { AppService } from './app.service';
import { SubWallet, SerializedSubWallet } from '../model/SubWallet';
import { StandardSubWallet } from '../model/StandardSubWallet';
import { InvalidVoteCandidatesHelper, InvalidCandidateForVote } from '../model/InvalidVoteCandidatesHelper';
import { CoinService } from './coin.service';
import { JsonRPCService } from './jsonrpc.service';
import { EthJsonRPCService } from './ethjsonrpc.service';
import { PopupProvider } from './popup.service';
import { Native } from './native.service';
import { InAppRPCMessage, RPCMethod, RPCStartWalletSyncParams, RPCStopWalletSyncParams, SPVSyncService } from './spvsync.service';
import { LocalStorage } from './storage.service';
import { AuthService } from './auth.service';
import { Transfer } from './cointransfer.service';
import { PrefsService } from './prefs.service';
import BigNumber from 'bignumber.js';
import { IDChainSubWallet } from '../model/IDChainSubWallet';
import { MainchainSubWallet } from '../model/MainchainSubWallet';

declare let appManager: AppManagerPlugin.AppManager;

class TransactionMapEntry {
    Code: number = null;
    Reason: string = null;
    WalletID: string = null;
    ChainID: string = null;
    Status: string = null;
    lock: boolean = false;
}

type TransactionMap = {
    [k: string]: TransactionMapEntry;
};

// TODO: Replace all the Promise<any> with real data structures
// TODO: Use real types everywhere, no "any" any more.

/***
 * wallet jni 交互
 *
 * WalletManager.ts -> Wallet.js -> wallet.java -> WalletManager.java
 */
@Injectable({
    providedIn: 'root'
})
export class WalletManager {
    public masterWallets: {
        [index: string]: MasterWallet
    } = {};

    // TODO: what is this map for? Can we rename it ?
    public transactionMap: TransactionMap = {}; // when sync over, need to cleanup transactionMap

    public hasPromptTransfer2IDChain = true;

    public needToCheckUTXOCountForConsolidation = true;
    public needToPromptTransferToIDChain = false; // Whether it's time to ask user to transfer some funds to the ID chain for better user experience or not.

    public spvBridge: SPVWalletPluginBridge = null;

    constructor(
        public events: Events,
        public native: Native,
        public zone: NgZone,
        public modalCtrl: ModalController,
        public translate: TranslateService,
        public localStorage: LocalStorage,
        private appService: AppService,
        private syncService: SPVSyncService,
        private coinService: CoinService,
        private authService: AuthService,
        public popupProvider: PopupProvider,
        private http: HttpClient,
        public jsonRPCService: JsonRPCService,
        public ethJsonRPCService: EthJsonRPCService,
        private prefs: PrefsService
    ) {
    }

    async init() {
        console.log("Master manager is initializing");

        this.spvBridge = new SPVWalletPluginBridge(this.native, this.events, this.popupProvider);

        let hasWallet = await this.initWallets();

        if (!this.appService.runningAsAService()) {
            if (!hasWallet) {
                this.goToLauncherScreen();
                return;
            }

            this.registerSubWalletListener();

            appManager.setListener((message) => {
                this.appService.onMessageReceived(message);
            });
            this.jsonRPCService.init();

            this.startSyncAllWallet();

            this.localStorage.get('hasPrompt').then((val) => {
                this.hasPromptTransfer2IDChain = val ? val : false;
            });

            let publishTxList = await this.localStorage.getPublishTxList();
            if (publishTxList) {
                this.transactionMap = publishTxList;
            }

            this.getAllMasterWalletBalanceByRPC();
        } else {
            // Start the sync service if we are in a background service
            await this.syncService.init(this);
        }

        console.log("Wallet manager initialization complete");

        this.events.publish("walletmanager:initialized");
    }

    private async initWallets(): Promise<boolean> {
        try {
            console.log("Getting all master wallets from the SPV SDK");
            const idList = await this.spvBridge.getAllMasterWallets();

            if (idList.length === 0) {
                console.log("No SPV wallet found, going to launcher screen");
                this.goToLauncherScreen();
                return false;
            }

            console.log("Got "+idList.length+" wallets from the SPVSDK");

            // Rebuild our local model for all wallets returned by the SPV SDK.
            for (var i = 0; i < idList.length; i++) {
                let masterId = idList[i];

                console.log("Rebuilding local model for subwallet id "+masterId);

                // Try to retrieve locally storage extended info about this wallet
                let extendedInfo = await this.localStorage.getExtendedMasterWalletInfos(masterId);
                if (!extendedInfo) {
                    // No backward compatibility support: old wallets are just destroyed.
                    await this.spvBridge.destroyWallet(masterId);
                    continue;
                } else {
                    console.log("Found extended wallet info for master wallet id " + masterId, extendedInfo);

                    // Create a model instance for each master wallet returned by the SPV SDK.
                    this.masterWallets[masterId] = new MasterWallet(this, this.coinService, masterId);

                    if (extendedInfo.subWallets.length < 3) {
                        // open IDChain and ETHSC automatic
                        let subwallet: SerializedSubWallet = extendedInfo.subWallets.find(wallet => wallet.id === StandardCoinName.IDChain);
                        if (!subwallet) {
                            console.log('Opening IDChain');
                            const subWallet = new IDChainSubWallet(this.masterWallets[masterId], StandardCoinName.IDChain);
                            extendedInfo.subWallets.push(subWallet.toSerializedSubWallet());
                        }
                        subwallet = extendedInfo.subWallets.find(wallet => wallet.id === StandardCoinName.ETHSC);
                        if (!subwallet) {
                            console.log('Opening ETHSC');
                            const subWallet = new MainchainSubWallet(this.masterWallets[masterId], StandardCoinName.ETHSC);
                            extendedInfo.subWallets.push(subWallet.toSerializedSubWallet());
                        }
                    }
                }

                await this.masterWallets[masterId].populateWithExtendedInfo(extendedInfo);
            }
        }
        catch (error) {
            console.error(error);
            return false;
        }
        return true;
    }

    // TODO: delete it, we do not use active wallet
    public setRecentWalletId(id) {
        this.localStorage.saveCurMasterId({ masterId: id });
    }

    public getMasterWallet(masterId: WalletID): MasterWallet {
        return this.masterWallets[masterId];
    }

    public getWalletsList(): MasterWallet[] {
        return Object.values(this.masterWallets);
    }

    public getWalletsCount(): number {
        return Object.values(this.masterWallets).length;
    }

    public walletNameExists(name: string): boolean {
        let existingWallet = Object.values(this.masterWallets).find((wallet) => {
            return wallet.name === name;
        });
        return existingWallet != null;
    }

    private goToLauncherScreen() {
        this.native.setRootRouter('/launcher');
    }

    public async getCurrentMasterIdFromStorage(): Promise<string> {
        let data = await this.localStorage.getCurMasterId();

        if (data && data["masterId"]) {
            return data["masterId"];
        }
        else {
            return null;
        }
    }

    /**
     * Creates a new master wallet both in the SPV SDK and in our local model.
     */
    public async createNewMasterWallet(
        masterId: WalletID,
        walletName: string,
        mnemonicStr: string,
        mnemonicPassword: string,
        payPassword: string,
        singleAddress: boolean
    ) {
        console.log("Creating new master wallet");

        await this.spvBridge.createMasterWallet(
            masterId,
            mnemonicStr,
            mnemonicPassword,
            payPassword,
            singleAddress
        );

        let account: WalletAccount = {
            singleAddress: singleAddress,
            Type: WalletAccountType.STANDARD
        };

        await this.addMasterWalletToLocalModel(masterId, walletName, account);
    }

    /**
     * Creates a new master wallet both in the SPV SDK and in our local model, using a given mnemonic.
     */
    public async importMasterWalletWithMnemonic(
        masterId: WalletID,
        walletName: string,
        mnemonicStr: string,
        mnemonicPassword: string,
        payPassword: string,
        singleAddress: boolean
    ) {
        console.log("Importing new master wallet with mnemonic");

        await this.spvBridge.importWalletWithMnemonic(masterId, mnemonicStr, mnemonicPassword, payPassword, singleAddress);

        let account: WalletAccount = {
            singleAddress: singleAddress,
            Type: WalletAccountType.STANDARD
        };

        await this.addMasterWalletToLocalModel(masterId, walletName, account);
    }

    private async addMasterWalletToLocalModel(id: WalletID, name: string, walletAccount: WalletAccount) {
        console.log("Adding master wallet to local model", id, name);

        // Add a new wallet to our local model
        this.masterWallets[id] = new MasterWallet(this, this.coinService, id, name);

        // Set some wallet account info
        this.masterWallets[id].account = walletAccount;

        // Get some basic information ready in our model.
        await this.masterWallets[id].populateWithExtendedInfo(null);

        // A master wallet must always have at least the ELA subwallet
        await this.masterWallets[id].createSubWallet(this.coinService.getCoinByID(StandardCoinName.ELA));

        // Even if not mandatory to have, we open the main sub wallets for convenience as well.
        await this.masterWallets[id].createSubWallet(this.coinService.getCoinByID(StandardCoinName.IDChain));
        await this.masterWallets[id].createSubWallet(this.coinService.getCoinByID(StandardCoinName.ETHSC));

        this.registerSubWalletListener();

        // Save state to local storage
        await this.saveMasterWallet(this.masterWallets[id]);

        this.setRecentWalletId(id);

        this.startWalletSync(id);

        // Go to wallet's home page.
        this.native.setRootRouter("/wallet-home");

        // Get balance by rpc
        this.getAllSubwalletsBalanceByRPC(id);
    }

    /**
     * Destroy a master wallet, active or not, base on its id
     */
    async destroyMasterWallet(id: string) {
        // Destroy the wallet in the wallet plugin
        await this.spvBridge.destroyWallet(id);

        // Save this modification to our permanent local storage
        await this.localStorage.setExtendedMasterWalletInfo(this.masterWallets[id].id, null);

        // Destroy from our local model
        delete this.masterWallets[id];

        // If there is at least one remaining wallet, select it as the new active wallet in the app.
        if (Object.values(this.masterWallets).length > 0) {
            const recentWalletId = await this.getCurrentMasterIdFromStorage();
            if (recentWalletId === id) {
                this.setRecentWalletId(this.masterWallets[0].id);
            }

            this.native.setRootRouter("/wallet-home");
        }
        else {
            this.goToLauncherScreen();
        }
    }

    /**
     * Save master wallets list to permanent local storage.
     */
    public async saveMasterWallet(masterWallet: MasterWallet) {
        const extendedInfo = masterWallet.getExtendedWalletInfo();
        console.log("Saving wallet extended info", masterWallet.id, extendedInfo);

        await this.localStorage.setExtendedMasterWalletInfo(masterWallet.id, extendedInfo);
    }

    public startSyncAllWallet() {
        for (const masterWallet of Object.values(this.masterWallets)) {
            this.startWalletSync(masterWallet.id);
        }
    }

    /**
     * Inform the background service (via RPC) that we want to start syncing a wallet.
     * If there is another wallet syncing, its on going sync will be stopped first.
     */
    public startWalletSync(masterId: WalletID) {
        console.log("Requesting sync service to start syncing wallet " + masterId);

        let messageParams: RPCStartWalletSyncParams = {
            masterId: masterId,
            chainIds: []
        };

        // Add only standard subwallets to SPV sync request
        for (let subWallet of Object.values(this.getMasterWallet(masterId).subWallets)) {
            if (subWallet.type == CoinType.STANDARD)
                messageParams.chainIds.push(subWallet.id as StandardCoinName);
        }

        let rpcMessage: InAppRPCMessage = {
            method: RPCMethod.START_WALLET_SYNC,
            params: messageParams
        };

        if (this.appService.runningAsAService()) {
            this.syncService.syncStartSubWallets(messageParams.masterId, messageParams.chainIds);
        } else {
            appManager.sendMessage("#service:walletservice", AppManagerPlugin.MessageType.INTERNAL, JSON.stringify(rpcMessage), () => {
                // Nothing to do
            }, (err) => {
                console.log("Failed to send start RPC message to the sync service", err);
            });
        }
    }

    // TODO: When wallet is destroyed
    private stopWalletSync(masterId: WalletID) {
        console.log("Requesting sync service to stop syncing wallet " + masterId);

        // Add only standard subwallets to SPV stop sync request
        let chainIds: StandardCoinName[] = [];
        for (let subWallet of Object.values(this.getMasterWallet(masterId).subWallets)) {
            if (subWallet.type == CoinType.STANDARD)
                chainIds.push(subWallet.id as StandardCoinName);
        }

        this.stopSubWalletsSync(masterId, chainIds);
    }

    private stopSubWalletsSync(masterId: WalletID, subWalletIds: StandardCoinName[]) {
        console.log("Requesting sync service to stop syncing some subwallets for wallet " + masterId);

        let messageParams: RPCStopWalletSyncParams = {
            masterId: masterId,
            chainIds: subWalletIds
        };

        let rpcMessage: InAppRPCMessage = {
            method: RPCMethod.STOP_WALLET_SYNC,
            params: messageParams
        };

        appManager.sendMessage("#service:walletservice", AppManagerPlugin.MessageType.INTERNAL, JSON.stringify(rpcMessage), () => {
            // Nothing to do
        }, (err) => {
            console.log("Failed to send stop RPC message to the sync service:", err);
        });
    }

    public stopSubWalletSync(masterId: WalletID, subWalletId: StandardCoinName) {
        this.stopSubWalletsSync(masterId, [subWalletId]);
    }

    /**
     * Start listening to all events from the SPV SDK.
     */
    public registerSubWalletListener() {
        // For now, don't listen to wallet events while in the service.
        if (this.appService.runningAsAService())
            return;

        console.log("Register wallet listener");

        this.spvBridge.registerWalletListener((event: SPVWalletMessage) => {
            this.zone.run(() => {
                this.handleSubWalletEvent(event);
            });
        });
    }

    /**
     * Handler for all SPV wallet events.
     */
    public handleSubWalletEvent(event: SPVWalletMessage) {
        let masterId = event.MasterWalletID;
        let chainId = event.ChainID;

        console.log("SubWallet message: ", masterId, chainId, event);
        //console.log(event.Action, event.result);

        switch (event.Action) {
            case "OnTransactionStatusChanged":
                if (this.transactionMap[event.txId]) {
                    this.transactionMap[event.txId].Status = event.status;
                }
                break;
            case "OnBlockSyncProgress":
                this.updateSyncProgressFromCallback(masterId, chainId, event);
                break;
            case "OnBalanceChanged":
                this.getMasterWallet(masterId).getSubWallet(chainId).updateBalance();
                break;
            case "OnTxPublished":
                this.handleTransactionPublishedEvent(event);
                break;

            case "OnBlockSyncStopped":
            case "OnAssetRegistered":
            case "OnBlockSyncStarted":
            case "OnConnectStatusChanged":
                // Nothing
                break;
            case "OnETHSCEventHandled":
                this.updateETHSCEventFromCallback(masterId, chainId, event);
                break;
        }
    }

    /**
     * Updates the progress value of current wallet synchronization. This progress change
     * is saved into the model and triggers events so that the UI can update itself.
     */
    private updateSyncProgressFromCallback(masterId: WalletID, chainId: StandardCoinName, result: SPVWalletMessage) {
        this.updateSyncProgress(masterId, chainId, result.Progress, result.LastBlockTime);
    }

    private updateSyncProgress(masterId: WalletID, chainId: StandardCoinName, progress: number, lastBlockTime: number) {
        this.masterWallets[masterId].updateSyncProgress(chainId, progress, lastBlockTime);

        if (!this.hasPromptTransfer2IDChain && (chainId === StandardCoinName.IDChain)) {
            let elaProgress = this.masterWallets[masterId].subWallets[StandardCoinName.ELA].progress;
            let idChainProgress = this.masterWallets[masterId].subWallets[StandardCoinName.IDChain].progress;

            // Check if it's a right time to prompt user for ID chain transfers, but only if we are fully synced.
            if (elaProgress == 100 && idChainProgress == 100) {
                this.checkIDChainBalance(masterId);
            }
        }
    }

    // ETHSC has different event
    private updateETHSCEventFromCallback(masterId: WalletID, chainId: StandardCoinName, result: SPVWalletMessage) {
        switch (result.event.Type) {
            case ETHSCEventType.EWMEvent: // update progress
                switch (result.event.Event) {
                    case ETHSCEventAction.PROGRESS:
                        result.Progress =  Math.round(result.event.PercentComplete);
                        result.LastBlockTime = result.event.Timestamp;
                        break;
                    case ETHSCEventAction.CHANGED:
                        if ('CONNECTED' === result.event.NewState) {
                            result.Progress =  100;
                            result.LastBlockTime = new Date().getTime();
                        }
                        break;
                    default:
                        // Do nothing
                        break;
                }
                this.updateSyncProgress(masterId, chainId, result.Progress, result.LastBlockTime);
                break;
            case ETHSCEventType.WalletEvent: // update balance
                if (result.event.Event === ETHSCEventAction.BALANCE_UPDATED) {
                    console.log('ETHSCEventAction.BALANCE_UPDATED:', result)
                    this.getMasterWallet(masterId).getSubWallet(chainId).updateBalance();

                    const erc20SubWallets = this.getMasterWallet(masterId).getSubWalletsByType(CoinType.ERC20);
                    for (let subWallet of erc20SubWallets) {
                        subWallet.updateBalance();
                    }
                }
                break;
            default:
                // TODO: check other event
                break;
        }
    }

    private handleTransactionPublishedEvent(data: SPVWalletMessage) {
        let MasterWalletID = data.MasterWalletID;
        let chainId = data.ChainID;
        let hash = data.hash;

        let result = JSON.parse(data["result"]) as TxPublishedResult;
        let code = result.Code;
        let reason = result.Reason;

        let tx = "txPublished-";

        // TODO: messy again - what is the transaction map type? Mix of TxPublishedResult and SPVWalletMessage ?
        if (this.transactionMap[hash]) {
            this.transactionMap[hash].Code = code;
            this.transactionMap[hash].Reason = reason;
            this.transactionMap[hash].WalletID = MasterWalletID;
            this.transactionMap[hash].ChainID = chainId;
        } else {
            this.transactionMap[hash] = new TransactionMapEntry();
            this.transactionMap[hash].WalletID = MasterWalletID;
            this.transactionMap[hash].ChainID = chainId;
            this.transactionMap[hash].Code = code;
            this.transactionMap[hash].Reason = reason;

            this.localStorage.savePublishTxList(this.transactionMap);
        }

        if (code !== 0) {
            console.log('OnTxPublished fail:', JSON.stringify(data));
            this.popupProvider.ionicAlert_PublishedTx_fail('transaction-fail', tx + code, hash, reason);
            if (this.transactionMap[hash].lock !== true) {
                delete this.transactionMap[hash];
                this.localStorage.savePublishTxList(this.transactionMap);
            }
        }
    }

    public setHasPromptTransfer2IDChain() {
        this.hasPromptTransfer2IDChain = true;
        this.needToPromptTransferToIDChain = false;
        this.localStorage.set('hasPrompt', true); // TODO: rename to something better than "hasPrompt"
    }

    // TODO: make a more generic flow to not do this only for the ID chain but also for the ETH chain.
    public checkIDChainBalance(masterId: WalletID) {
        if (this.hasPromptTransfer2IDChain) { return; }
        if (this.needToPromptTransferToIDChain) { return; }

        // // IDChain not open, do not prompt
        // if (Util.isNull(this.masterWallet[this.curMasterId].subWallets[Config.IDCHAIN])) {
        //     return;
        // }

        const masterWallet = this.getMasterWallet(masterId);
        if (masterWallet.subWallets[StandardCoinName.ELA].balance.lte(1000000)) {
            console.log('ELA balance ', masterWallet.subWallets[StandardCoinName.ELA].balance);
            return;
        }

        if (masterWallet.subWallets[StandardCoinName.IDChain].balance.gt(100000)) {
            console.log('IDChain balance ',  masterWallet.subWallets[StandardCoinName.IDChain].balance);
            return;
        }

        this.needToPromptTransferToIDChain = true;
    }

    // for intent
    // TODO: What's this? lock what for what?
    lockTx(hash) {
        if (this.transactionMap[hash]) {
            this.transactionMap[hash].lock = true;
        } else {
            this.transactionMap[hash] = new TransactionMapEntry();
            this.transactionMap[hash].lock = true;

            this.localStorage.savePublishTxList(this.transactionMap);
        }
    }

    public getTxCode(hash) {
        let code = 0;
        if (this.transactionMap[hash].Code) {
            code = this.transactionMap[hash].Code;
        }

        if (this.transactionMap[hash].Status === 'Deleted') { // success also need delete
            delete this.transactionMap[hash];
            this.localStorage.savePublishTxList(this.transactionMap);
        } else {
            this.transactionMap[hash].lock = false;
        }

        return code;
    }

    cleanTransactionMap() {
        this.transactionMap = {};
        this.localStorage.savePublishTxList(this.transactionMap);
    }

    /**
     * Retrieves the wallet store password from the password manager.
     * This method is here since the beginning and seems useless. Could probably be replaced by
     * authService's getWalletPassword() directly.
     */
    public async openPayModal(transfer: Transfer): Promise<string> {
        const payPassword = await this.authService.getWalletPassword(transfer.masterWalletId, true, true);
        if (payPassword === null) {
            return Promise.resolve(null);
        }
        transfer.payPassword = payPassword;

        return Promise.resolve(payPassword);
    }

    /**
     * Voting requires to provide a list of invalid candidates.
     *
     * Here is an example:
     *
     * The vote information in the last vote transaction is
     * 1) vote 3 dpos nodes[D1,D2,D3, 3 ELA for each]
     * 2) vote proposal[P1, 10 ELA for it]
     * 3) impeach CR member[CR-1, 8 ELA for him]
     * 4) vote for CR Candidate [C1:2ELA, C2:5ELA]
     *
     * Now we want to vote to against a proposal P2, and deal with the data above, the result will be:
     *
     * 1) check if D1~D3 are valid now. If D3 is unregistered, D3 is illegal and need to pass into invalidCandidates
     * 2) check if Proposal P1 is still in Notification. If not, put it into invalidCandidates too. Otherwise, you need to record this data and add it to the new vote payload
     * 3) check if CR member CR-1 has been impeached and he is not a CR member now. If he is not a CR member now, we should put CR-1 into invalidCandidates.
     * 4) check whether it is in the election period. If it's not in the election period, we need to put C1 and C2 in invalidCandidates.
     */
    public async computeVoteInvalidCandidates(masterWalletId: string): Promise<InvalidCandidateForVote[]> {
        let helper = new InvalidVoteCandidatesHelper(this.http, this, masterWalletId, this.prefs);
        return await helper.computeInvalidCandidates();
    }

    async getAllMasterWalletBalanceByRPC() {
        for (const masterWallet of Object.values(this.masterWallets)) {
            await this.getAllSubwalletsBalanceByRPC(masterWallet.id);
        }
    }

    async getAllSubwalletsBalanceByRPC(masterWalletId) {
        const currentTimestamp = moment().valueOf();
        const onedayago = moment().add(-1, 'days').valueOf();
        const masterWallet = this.getMasterWallet(masterWalletId);

        let subwallets = masterWallet.subWalletsWithExcludedCoin(StandardCoinName.ETHSC, CoinType.STANDARD);
        for (let subWallet of subwallets) {
            // Get balance by RPC if the last block time is one day ago.
            if (!subWallet.lastBlockTime || (moment(subWallet.lastBlockTime).valueOf() < onedayago)) {
                try {
                    const balance = await this.getBalanceByRPC(masterWalletId, subWallet.id as StandardCoinName, masterWallet.account.singleAddress);
                    subWallet.balanceByRPC = balance;
                    subWallet.balance = balance;
                    subWallet.timestampRPC = currentTimestamp;
                } catch (e) {
                    console.log('getBalanceByRPC exception:', e);
                }
            }
        }
    }

    //
    async getBalanceByRPC(masterWalletID: string, chainID: StandardCoinName, singleAddress: boolean): Promise<BigNumber> {
        console.log('TIMETEST getBalanceByRPC start:', chainID);

        // If the balance of 5 consecutive request is 0, then end the query.(100 addresses)
        let maxRequestTimesOfGetEmptyBalance = 5;
        let requestTimesOfGetEmptyBalance = 0;
        // In order to calculate blanks
        let requestAddressCountOfInternal = 1;
        let requestAddressCountOfExternal = 1;

        let startIndex = 0;
        let totalBalance = new BigNumber(0);
        let totalRequestCount = 0;

        console.log('Internal address');

        // internal address
        let addressArray = null;
        do {
            addressArray = await this.spvBridge.getAllAddresses(masterWalletID, chainID, startIndex, true);
            if (addressArray.Addresses.length === 0) {
                requestAddressCountOfInternal = startIndex;
                totalRequestCount = startIndex;
                break;
            }
            startIndex += addressArray.Addresses.length;

            try {
                const balance = await this.jsonRPCService.getBalanceByAddress(chainID, addressArray.Addresses);
                totalBalance = totalBalance.plus(balance);

                if (balance.lte(0)) {
                    requestTimesOfGetEmptyBalance++;
                    if (requestTimesOfGetEmptyBalance >= maxRequestTimesOfGetEmptyBalance) {
                        requestAddressCountOfInternal = startIndex;
                        totalRequestCount = startIndex;
                        break;
                    }
                } else {
                    requestTimesOfGetEmptyBalance = 0;
                }
            } catch (e) {
                console.log('jsonRPCService.getBalanceByAddress exception:', e);
                throw e;
            }
        } while (!singleAddress);

        console.log('External address');

        if (!singleAddress) {
            // external address for user
            const currentReceiveAddress = await this.spvBridge.createAddress(masterWalletID, chainID);
            let currentReceiveAddressIndex = -1;
            let startCheckBlanks = false;

            maxRequestTimesOfGetEmptyBalance = 1; // is 1 ok for external?
            startIndex = 0;
            while (true) {
                const addressArray = await this.spvBridge.getAllAddresses(masterWalletID, chainID, startIndex, false);
                if (addressArray.Addresses.length === 0) {
                    requestAddressCountOfExternal = startIndex;
                    totalRequestCount += startIndex;
                    break;
                }
                startIndex += addressArray.Addresses.length;
                if (currentReceiveAddressIndex === -1) {
                    currentReceiveAddressIndex = addressArray.Addresses.findIndex((address) => (address === currentReceiveAddress));
                    if (currentReceiveAddressIndex !== -1) {
                        currentReceiveAddressIndex += startIndex;
                        startCheckBlanks = true;
                    }
                }

                try {
                    const balance = await this.jsonRPCService.getBalanceByAddress(chainID, addressArray.Addresses);
                    totalBalance = totalBalance.plus(balance);

                    if (startCheckBlanks) {
                        if (balance.lte(0)) {
                            requestTimesOfGetEmptyBalance++;
                            if (requestTimesOfGetEmptyBalance >= maxRequestTimesOfGetEmptyBalance) {
                                requestAddressCountOfExternal = startIndex;
                                totalRequestCount += startIndex;
                                break;
                            }
                        } else {
                            requestTimesOfGetEmptyBalance = 0;
                        }
                    }
                } catch (e) {
                    console.log('jsonRPCService.getBalanceByAddress exception:', e);
                    throw e;
                }
            }
        }

        console.log('TIMETEST getBalanceByRPC ', chainID, ' end');
        console.log('getBalanceByRPC totalBalance:', totalBalance,
                ' totalRequestCount:', totalRequestCount,
                ' requestAddressCountOfInternal:', requestAddressCountOfInternal,
                ' requestAddressCountOfExternal:', requestAddressCountOfExternal);

        return totalBalance;
    }

    sendIntentResponse(action, result, intentId): Promise<void> {
        return new Promise((resolve, reject)=>{
            appManager.sendIntentResponse(action, result, intentId, () => {
                resolve();
            }, (err) => {
                console.error('sendIntentResponse error!', err);
                reject(err);
            });
        });
    }
}
