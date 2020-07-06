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
import { Events, ModalController, Platform } from '@ionic/angular';
import { Config } from '../config/Config';
import { Native } from './native.service';
import { PopupProvider } from './popup.service';
import { Util } from '../model/Util';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorage } from './storage.service';
import { SignedTransaction, SPVWalletPluginBridge, SPVWalletMessage, TxPublishedResult } from '../model/SPVWalletPluginBridge';
import { PaymentboxComponent } from '../components/paymentbox/paymentbox.component';
import { MasterWallet, WalletID, CoinName } from '../model/MasterWallet';
import { SubWallet } from '../model/SubWallet';
import { Transfer } from '../model/Transfer';

declare let appManager: AppManagerPlugin.AppManager;
declare let notificationManager: NotificationManagerPlugin.NotificationManager;

export class WalletObjTEMP {
    masterId: string;
    mnemonicStr: string;
    mnemonicList: any[];
    mnemonicPassword: string;
    payPassword: string;
    singleAddress: boolean;
    isMulti: boolean;
    name: string;
}

export class CoinObjTEMP {
    transfer: Transfer; // TODO: messy class that embeds too many unrelated things...
    walletInfo: any; // TODO: type
}

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
}

// TODO: Replace all the Promise<any> with real data structures
// TODO: Use real types everywhere, no "any" any more.

/***
 * wallet jni 交互
 *
 * WalletManager.ts -> Wallet.js -> wallet.java -> WalletManager.java
 */
@Injectable()
export class WalletManager {
    public static LIMITGAP = 500;   // TODO: What's this?
    public static FEEPERKb = 500;   // TODO: feed for what? Rename

    public curMaster: MasterWallet = null;

    public masterWallets: {
        [index: string]: MasterWallet
    } = {};

    public curMasterId: string = "-1"; // TODO: why can't we get this from "masterWallet" ?
    public walletInfos: any = {}; // TODO: typings + what's this?
    public walletObjs: any = {}; // TODO: typings + what's this?
    // TODO: DELETE ME - public masterWalletList: MasterWallet[] = [];
    public walletObj: WalletObjTEMP; // TODO: Rework this - what is this object? active wallet? Define a type.
    public coinObj: CoinObjTEMP; // TODO - Type. Temporary coin context shared by screens.

    public subWallet: {
        ELA: SubWallet
    };
    public name: string = ''; // TODO: name of what?

    private masterIdFromStorage = '-1';
    public masterInfos: any = {};
    public masterList: any = {};
    public transactionMap: TransactionMap = {}; // when sync over, need to cleanup transactionMap

    public hasPromptTransfer2IDChain = true;

    public hasSendSyncCompletedNotification = {ELA: false, IDChain: false};
    public needToCheckUTXOCountForConsolidation = true;
    public needToPromptTransferToIDChain = false; // Whether it's time to ask user to transfer some funds to the ID chain for better user experience or not.

    public spvBridge: SPVWalletPluginBridge = null;

    constructor(public events: Events,
                public native: Native,
                public zone: NgZone,
                public modalCtrl: ModalController,
                public translate: TranslateService,
                public localStorage: LocalStorage,
                private platform: Platform,
                public popupProvider: PopupProvider) {
    
        // Wait for trinity plugins to be erady before doing anything.
        this.platform.ready().then(()=>{
            this.init();
        });
    }

    async init() {
        console.log("Master manager is initializing");

        this.spvBridge = new SPVWalletPluginBridge(this.native, this.events, this.popupProvider);

        await this.getCurrentMasterIdFromStorage();

        let infos = await this.localStorage.getMasterInfos();
        console.log("Got master infos", infos);

        if (infos != null) {
            this.masterInfos = infos;
        } else {
            console.warn("Empty Master info returned!");
        }

        try {
            let idList = await this.spvBridge.getAllMasterWallets();
            this.masterList = idList;

            console.log("Master list:", this.masterList);

            if (idList.length === 0) {
                this.handleNull();
                return;
            }

            if (idList.length != Object.keys(this.masterInfos).length)
                console.error("Local storage wallet list and SPVSDK list have different sizes!");

            for (var i = 0; i < idList.length; i++) {
                let id = idList[i];
                if (this.masterInfos[id]) {
                    this.masterWallets[id] = this.masterInfos[id];
                }
                else {
                    this.masterWallets[id] = new MasterWallet(this, id);
                }
                await this.masterWallets[id].populateMasterWalletSPVInfo();
            }
        }
        catch (error) {
            this.native.hideLoading();
            if (error["code"] === 10002) {
                this.handleNull();
            }
        }

        this.localStorage.get('hasPrompt').then( (val) => {
            this.hasPromptTransfer2IDChain = val ? val : false;
        });

        let publishTxList = await this.localStorage.getPublishTxList();
        if (publishTxList) {
            this.transactionMap = publishTxList;
        }
    }

    public getWalletName(id: WalletID) {
        if (this.walletInfos[id]) {
            return this.walletInfos[id]["wallname"] || "";
        }
        else {
            return "";
        }
    }

    public getSubWallet(id) {
        return this.masterWallets[id].chainList || null;
    }

    public getSubWalletList() {
        var coinList = [];
        let mastId = this.getCurMasterWalletId();
        let subwallet = this.getSubWallet(mastId);
        if (subwallet != null) {
            for (let index in subwallet) {
                let coin = subwallet[index];
                if (coin != 'ELA') {
                    coinList.push({ name: coin });
                }
            }
        }

        return coinList;
    }

    public getCurMasterWalletId() {
        return this.curMasterId;
    }

    public setCurMasterWalletId(id) {
        this.setCurMasterId(id);
    }

    public getAccountType(curMasterId) {
        if (this.walletInfos[curMasterId]) {
            return this.walletInfos[curMasterId]["Account"] || {};
        }
        else {
            return {};
        }
    }

    public walletNameExists(name: string): boolean {
        // TODO: Make sure this new post-rework implementation works as expected.
        let existingWallet = Object.values(this.masterWallets).find((wallet)=>{
            return wallet.name === name;
        });
        return existingWallet != null;
       
        /*let data = Config.getMappingList();
        if (this.isEmptyObject(data)) {
            return false;
        }
        var isexit = true;
        for (var key in data) {
            var item = data[key];

            if (item["wallname"] === name) {
                isexit = true;
                break;
            } else {
                isexit = false;
            }
        }

        return isexit;*/
    }

    handleNull() {
        console.log("HANDLE NULL");
        this.native.setRootRouter('/launcher');
    }

    private async getCurrentMasterIdFromStorage(): Promise<any> {
        let data = await this.localStorage.getCurMasterId();
        if (data && data["masterId"]) {
            this.masterIdFromStorage = data["masterId"];
        }
    }

    public async addMasterWallet(id, name) {
        // Add a new wallet to our local model
        this.masterWallets[id] = new MasterWallet(id, name);
        this.masterList.push(id);

        await this.masterWallets[id].populateMasterWalletSPVInfo(true);
    }

    /**
     * Destroy a master wallet, active or not, base on its id
     */
    async destroyMasterWallet(id: string) {
        // Destroy the wallet in the wallet plugin
        await this.spvBridge.destroyWallet(id);

        // Destroy from our local model
        this.masterWallets[id] = null;
        for (var i = 0; i < this.masterList.length; i++) {
            if (this.masterList[i] === id) {
                this.masterList.splice(i, 1);
                break;
            }
        }
        if (this.curMasterId === id) {
            this.curMasterId = '-1';
        }

        // Save this modification to our permanent local storage
        this.saveInfos();

        // If there is at least one remaining wallet, select it as the new active wallet in the app.
        if (this.masterList.length > 0) {
            this.setCurMasterId(this.masterList[0]);
        }
        else {
            this.handleNull();
        }
    }

    public saveInfos() {
        this.localStorage.setMasterInfos(this.masterWallets);
    }

    private async syncStartSubWallets(masterId) {
        // TODO: rework: use null, not "-1"
        if (masterId == "-1") {
            return;
        }

        for (var i = 0; i < this.masterWallets[masterId].chainList.length; i++) {
            var chainId = this.masterWallets[masterId].chainList[i];
            this.spvBridge.syncStart(masterId, chainId);
        }
    }

    private syncStopSubWallets(masterId) {
        if (masterId == "-1") {
            return;
        }

        for (var i = 0; i < this.masterWallets[masterId].chainList.length; i++) {
            var chainId = this.masterWallets[masterId].chainList[i];
            this.spvBridge.syncStop(masterId, chainId);
        }
    }

    public setCurMasterId(id) {
        if (id != this.curMasterId) {
            this.syncStopSubWallets(this.curMasterId);
            this.localStorage.saveCurMasterId({ masterId: id }).then((data) => {
                this.curMasterId = id;
                this.curMaster = this.masterWallets[id];
                this.syncStartSubWallets(id);
                this.native.setRootRouter("/tabs");
            });
        }
    }

    public getCurMasterId() {
        return this.curMasterId;
    }

    public removeSubWallet(masterId: string, chainId: string) {
        this.zone.run(() => {
            this.masterWallets[masterId].subWallets[chainId] = null;
            for (var i = 0; i < this.masterWallets[masterId].chainList.length; i++) {
                if (this.masterWallets[masterId].chainList[i] == chainId) {
                    this.masterWallets[masterId].chainList.splice(i, 1);
                    break;
                }
            }
            console.log(this.masterWallets[masterId]);
        });
    }

    public handleSubWalletCallback(result: SPVWalletMessage) {
        let masterId = result.MasterWalletID;
        let chainId = result.ChainID;

        switch (result.Action) {
            case "OnTransactionStatusChanged":
                // console.log('OnTransactionStatusChanged ', result);
                if (this.transactionMap[result.txId]) {
                    this.transactionMap[result.txId].Status = result.status;
                }
                break;
            case "OnBlockSyncStarted":
                break;
            case "OnBlockSyncProgress":
                // console.log('OnBlockSyncProgress ', result);
                this.masterWallets[masterId].setProgress(chainId, result.Progress, result.LastBlockTime);
                break;
            case "OnBlockSyncStopped":
                break;
            case "OnBalanceChanged":
                // console.log('OnBalanceChanged ', result);
                this.updateWalletBalance(masterId, chainId);
                break;
            case "OnTxPublished":
                // console.log('OnTxPublished ', result);
                this.OnTxPublished(result);
                break;
            case "OnAssetRegistered":
                break;
            case "OnConnectStatusChanged":
                break;
        }
    }

    private updateWalletBalance(masterId: WalletID, chainId: CoinName) {
        this.masterWallets[masterId].updateWalletBalance(chainId);
    }

    OnTxPublished(data: SPVWalletMessage) {
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

    public checkIDChainBalance() {
        if (this.hasPromptTransfer2IDChain) { return; }
        if (this.needToPromptTransferToIDChain) { return; }

        // // IDChain not open, do not prompt
        // if (Util.isNull(this.masterWallet[this.curMasterId].subWallet[Config.IDCHAIN])) {
        //     return;
        // }

        if (this.masterWallets[this.curMasterId].subWallets[CoinName.ELA].balance <= 1000000) {
            console.log('ELA balance ', this.masterWallets[this.curMasterId].subWallets[CoinName.ELA].balance);
            return;
        }

        if (this.masterWallets[this.curMasterId].subWallets[CoinName.IDCHAIN].balance > 100000) {
            console.log('IDChain balance ', this.masterWallets[this.curMasterId].subWallets[CoinName.IDCHAIN].balance);
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

    private getTxCode(hash) {
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
     * Prompts and returns wallet password to user.
     */
    getPassword(transfer): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const props = this.native.clone(transfer);
            const modal = await this.modalCtrl.create({
                component: PaymentboxComponent,
                componentProps: props
            });
            modal.onDidDismiss().then((params) => {
                if (params.data) {
                    resolve(params.data);
                } else {
                    resolve(null);
                }
            });
            modal.present();
        });
    }

    /**
     * Opens the payment popup with all the necessary transaction information.
     * Once password is entered by the user, a transaction is created and signed, then sent
     * for the SPV SDK for publishing.
     */
    async openPayModal(transfer) {
        const payPassword = await this.getPassword(transfer);
        if (payPassword === null) {
            return;
        }
        transfer.payPassword = payPassword;

        await this.native.showLoading();
        this.signAndSendTransaction(transfer);
    }

    /**
     * Signs raw transaction and sends the signed transaction to the SPV SDK for publication.
     */
    async signAndSendTransaction(transfer) {
        let signedTx = await this.spvBridge.signTransaction(this.curMasterId,
                                           transfer.chainId,
                                           transfer.rawTransaction,
                                           transfer.payPassword);

        this.sendTransaction(transfer, signedTx);
    }

    private async sendTransaction(transfer, signedTx: SignedTransaction) {
        let publishedTransaction = await this.spvBridge.publishTransaction(this.curMasterId, transfer.chainId, signedTx);
        
        if (!Util.isEmptyObject(transfer.action)) {
            this.lockTx(publishedTransaction.TxHash);

            setTimeout(() => {
                let txId = publishedTransaction.TxHash;
                const code = this.getTxCode(txId);
                if (code !== 0) {
                    txId = null;
                }
                this.native.hideLoading();
                this.native.toast_trans('send-raw-transaction');
                this.native.setRootRouter('/wallet-home');
                console.log('Sending intent response', transfer.action, {txid: txId}, transfer.intentId);
                appManager.sendIntentResponse(transfer.action, {txid: txId}, transfer.intentId);
            }, 5000); // wait for 5s for txPublished
        } else {
            console.log(publishedTransaction.TxHash);

            this.native.hideLoading();
            this.native.toast_trans('send-raw-transaction');
            this.native.setRootRouter('/wallet-home');
        }
    }

    /**
     * Sends a system notification inside elastOS when the wallet completes his synchronization for the first time.
     * This way, users know when they can start using their wallet in third party apps.
     */
    sendSyncCompletedNotification(chainId) {
      if (this.hasSendSyncCompletedNotification[chainId] === false) {
        console.log('sendSyncCompletedNotification:', chainId);

        const request: NotificationManagerPlugin.NotificationRequest = {
          key: chainId + '-syncCompleted',
          title: chainId + ': ' + this.translate.instant('sync-completed'),
        };
        notificationManager.sendNotification(request);

        this.hasSendSyncCompletedNotification[chainId] = true;
      }
    }
}
