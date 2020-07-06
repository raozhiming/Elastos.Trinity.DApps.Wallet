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
import { Events, ModalController } from '@ionic/angular';
import { Config } from '../config/Config';
import { Native } from './native.service';
import { PopupProvider } from './popup.Service';
import { Util } from '../model/Util';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from './app.service';
import { LocalStorage } from './storage.service';
import { WalletID, SignedTransaction, SPVWalletPluginBridge } from '../model/SPVWalletPluginBridge';
import { PaymentboxComponent } from '../components/paymentbox/paymentbox.component';
import { MasterWallet } from '../model/MasterWallet';
import { SubWallet } from '../model/SubWallet';
import { Transfer } from '../model/Transfer';

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

export enum CoinName {
    ELA = 'ELA',
    IDCHAIN = 'IDChain'
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

    public curMaster: MasterWallet = new MasterWallet();

    public masterWallets: {
        [index: string]: MasterWallet
    };

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
    public progress: any = {};
    public masterList: any = {};
    public transactionMap: any = {}; // when sync over, need to cleanup transactionMap

    public hasPromptTransfer2IDChain = true;

    public hasSendSyncCompletedNotification = {ELA: false, IDChain: false};

    public spvBridge: SPVWalletPluginBridge = null;

    constructor(public events: Events,
                public native: Native,
                public zone: NgZone,
                public modalCtrl: ModalController,
                public translate: TranslateService,
                public appService: AppService,
                public localStorage: LocalStorage,
                public popupProvider: PopupProvider) {
      this.init();
    }

    async init() {
        console.log("Master manager is initializing");

        this.spvBridge = new SPVWalletPluginBridge(this.native, this.events, this.popupProvider);

        await this.getCurMasterIdFromStorage();

        let infos = await this.localStorage.getMasterInfos();
        console.log("Got master infos", infos);

        if (infos != null) {
            this.masterInfos = infos;
        } else {
            console.warn("Empty Master info returned!");
        }

        let progress = await this.localStorage.getProgress();
        if (progress) {
            this.progress = progress;
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
                    this.masterWallets[id] = new MasterWallet();
                }
                await this.getMasterWalletBasicInfo(id);
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
            wallet.name === name;
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
        this.native.setRootRouter('/launcher');
    }

    private async getCurMasterIdFromStorage(): Promise<any> {
        let data = await this.localStorage.getCurMasterId();
        if (data && data["masterId"]) {
            this.masterIdFromStorage = data["masterId"];
        }
    }

    private async getMasterWalletBasicInfo(masterId, isAdd = false) {
        console.log("Getting basic wallet info for wallet:", masterId);

        this.masterWallets[masterId].account = await this.spvBridge.getMasterWalletBasicInfo(masterId);
        await this.getAllSubWallets(masterId, isAdd);
    }

    public async getAllSubWallets(masterId, isAdd = false) {
        console.log("Getting all subwallets for wallet:", masterId, isAdd);

        let data = await this.spvBridge.getAllSubWallets(masterId);
        this.masterWallets[masterId].chainList = [];
        if (!this.masterWallets[masterId].subWallets) {
            this.masterWallets[masterId].subWallets = {};
        }
        for (let index in data) {
            let chainId = data[index];
            this.addSubWallet(masterId, chainId);
        }

        if (isAdd) {
            this.saveInfos();
            this.setCurMasterId(masterId);
            this.appService.setIntentListener();
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
                this.appService.setIntentListener();
                this.native.setRootRouter("/tabs");
            }
        }
    }

    // TODO: a "get" api should not "update" anything. Rename.
    public async getWalletBalance(masterId: string, chainId: string) {
        let balance = await this.spvBridge.getBalance(masterId, chainId);
        // TODO: Why a zone run here? Let's hope we are not updating UI directly from this sercicxe model...
        this.zone.run(() => {
            // balance in SELA
            this.masterWallets[masterId].subWallets[chainId].balance = parseInt(balance, 10);
            let idChainBalance = 0;
            if (this.masterWallets[masterId].subWallets[CoinName.IDCHAIN]) {
                idChainBalance = this.masterWallets[masterId].subWallets[CoinName.IDCHAIN].balance;
            }
            // rate = 1
            this.masterWallets[masterId].totalBalance = this.masterWallets[masterId].subWallets[CoinName.ELA].balance + idChainBalance;
        });
    }

    public async addMasterWallet(id, name) {
        this.masterWallets[id] = new MasterWallet(name);
        this.masterList.push(id);
        await this.getMasterWalletBasicInfo(id, true);
    }

    async destroyMasterWallet(id) {
        await this.spvBridge.destroyWallet(id);
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
        this.saveInfos();
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

    public async addSubWallet(masterId, chainId) {
        this.masterWallets[masterId].chainList.push(chainId);
        if (!this.masterWallets[masterId].subWallets[chainId]) {
            this.masterWallets[masterId].subWallets[chainId] = new SubWallet();
        } else {
            if (this.progress && this.progress[masterId] && this.progress[masterId][chainId]) {
                const lastblocktime = this.progress[masterId][chainId].lastblocktime;
                if (lastblocktime) {
                    this.masterWallets[masterId].subWallets[chainId].lastblocktime = lastblocktime;
                    this.masterWallets[masterId].subWallets[chainId].timestamp = 0;
                }
            }
        }

        this.spvBridge.registerWalletListener(masterId, chainId, (ret)=>{
            this.zone.run(() => {
                this.handleSubWalletCallback(ret);
            });
        });

        this.getWalletBalance(masterId, chainId);
    }

    public removeSubWallet(masterId, chainId) {
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

    public handleSubWalletCallback(result) {
        let masterId = result["MasterWalletID"];
        let chainId = result["ChainID"];

        switch (result["Action"]) {
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
                this.zone.run(() => {
                    this.setProgress(masterId, chainId, result.Progress, result.LastBlockTime);
                });
                break;
            case "OnBlockSyncStopped":
                break;
            case "OnBalanceChanged":
                // console.log('OnBalanceChanged ', result);
                this.getWalletBalance(masterId, chainId);
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

    OnTxPublished(data) {
        let hash = data["hash"];
        let result = JSON.parse(data["result"]);
        let code = result["Code"];
        let reason = result["Reason"];
        let tx = "txPublished-";
        let MasterWalletID = data["MasterWalletID"];
        let chainId = data["ChainID"];

        if (this.transactionMap[hash]) {
            this.transactionMap[hash].Code = code;
            this.transactionMap[hash].Reason = reason;
            this.transactionMap[hash].WalletID = MasterWalletID;
            this.transactionMap[hash].ChainID = chainId;
        } else {
            this.transactionMap[hash] = {
                WalletID : MasterWalletID,
                ChainID : chainId,
                Code : code,
                Reason: reason,
            };
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

    public setProgress(masterId, coin, progress, lastBlockTime) {
        this.masterWallets[masterId].subWallets[coin].progress = progress;
        const datetime = Util.dateFormat(new Date(lastBlockTime * 1000), 'yyyy-MM-dd HH:mm:ss');
        this.masterWallets[masterId].subWallets[coin].lastblocktime = datetime;

        if (!this.progress[masterId]) {
            this.progress[masterId] = {};
        }
        if (!this.progress[masterId][coin]) {
            this.progress[masterId][coin] = {};
        }

        this.progress[masterId][coin].lastblocktime = datetime;
        this.localStorage.setProgress(this.progress);

        if (!this.hasPromptTransfer2IDChain && (coin === CoinName.IDCHAIN) && (progress === 100)) {
            this.checkIDChainBalance();
        }

        if (progress === 100) {
          this.sendSyncCompletedNotification(coin);
        }

        const curTimerstamp = (new Date()).getTime();
        // console.log('curTimerstamp ', curTimerstamp);
        if (curTimerstamp - this.masterWallets[masterId].subWallets[coin].timestamp > 5000) { // 5s
            this.events.publish(coin + ':syncprogress', {coin});
            this.masterWallets[masterId].subWallets[coin].timestamp = curTimerstamp;
        }
        if (progress === 100) {
            this.events.publish(coin + ':synccompleted', {coin});
        }
    }

    public setHasPromptTransfer2IDChain() {
        this.hasPromptTransfer2IDChain = true;
        Config.needPromptTransfer2IDChain = false;
        this.localStorage.set('hasPrompt', true);
    }

    public checkIDChainBalance() {
        if (this.hasPromptTransfer2IDChain) { return; }
        if (Config.needPromptTransfer2IDChain) { return; }

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

        console.log('set needPromptTransfer2IDChain true');
        Config.needPromptTransfer2IDChain = true;
    }

    // for intent
    lockTx(hash) {
        if (this.transactionMap[hash]) {
            this.transactionMap[hash].lock = true;
        } else {
            this.transactionMap[hash] = {lock : true};
            //
            this.localStorage.savePublishTxList(this.transactionMap);
        }
    }

    public getTxCode(hash) {
        let code = 0;
        if (this.transactionMap[hash].Code) {
            code = this.transactionMap[hash].Code;
        }

        if (this.transactionMap[hash].Status === 'Deleted') {// success also need delete
            delete this.transactionMap[hash];
            this.localStorage.savePublishTxList(this.transactionMap);
        } else {
            this.transactionMap[hash].lock = false;
        }

        return code;
    }

    cleanTransactionMap() {
        this.transactionMap = [];
        this.localStorage.savePublishTxList(this.transactionMap);
    }

    // publish transaction
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

    async openPayModal(transfer) {
        const payPassword = await this.getPassword(transfer);
        if (payPassword === null) {
            return;
        }
        transfer.payPassword = payPassword;

        await this.native.showLoading();
        this.signAndSendTransaction(transfer);
    }

    async signAndSendTransaction(transfer) {
        let signedTx = await this.spvBridge.signTransaction(this.curMasterId,
                                           transfer.chainId,
                                           transfer.rawTransaction,
                                           transfer.payPassword);

        this.sendTransaction(transfer, signedTx);
    }

    async sendTransaction(transfer, signedTx: SignedTransaction) {
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
                this.native.setRootRouter('/tabs');
                console.log('Sending intent response', transfer.action, {txid: txId}, transfer.intentId);
                this.appService.sendIntentResponse(transfer.action, {txid: txId}, transfer.intentId);
            }, 5000); // wait for 5s for txPublished
        } else {
            console.log(publishedTransaction.TxHash);

            this.native.hideLoading();
            this.native.toast_trans('send-raw-transaction');
            this.native.setRootRouter('/tabs');
        }
    }

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
