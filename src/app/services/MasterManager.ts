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

import { NgZone } from '@angular/core';
import { Events, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { PaymentboxComponent } from '../components/paymentbox/paymentbox.component';
import { AppService } from './AppService';
import { Native } from './Native';
import { Config } from './Config';
import { LocalStorage } from './Localstorage';
import { PopupProvider } from './popup';
import { WalletManager } from './WalletManager';
import { Util } from './Util';

declare let notificationManager: NotificationManagerPlugin.NotificationManager;

export class MasterManager {

    public subWallet = {};
    public name: string = '';

    public masterWallet: any = {};
    public curMasterId: string = "-1";
    private masterIdFromStorage = '-1';
    public curMaster: any = {};
    public masterInfos: any = {};
    public progress: any = {};
    public masterList: any = {};
    public transactionMap: any = {}; // when sync over, need to cleanup transactionMap

    public hasPromptTransfer2IDChain = true;

    public hasSendSyncCompletedNotification = {ELA: false, IDChain: false};

    constructor(public events: Events,
                public native: Native,
                public zone: NgZone,
                public modalCtrl: ModalController,
                public translate: TranslateService,
                public appService: AppService,
                public localStorage: LocalStorage,
                public popupProvider: PopupProvider,
                public walletManager: WalletManager) {
      this.init();
    }

    init() {
        console.log("Master manager is initializing");

        this.getCurMasterIdFromStorage();

        this.localStorage.getMasterInfos((infos) => {
            console.log("Got master infos", infos);

            if (infos != null) {
                this.masterInfos = infos;
            } else {
                console.warn("Empty Master info returned!");
            }

            this.localStorage.getProgress((progress) => {
                if (progress) {
                    this.progress = progress;
                }
                this.walletManager.getAllMasterWallets((ret) => this.successHandle(ret), (err) => this.errorHandle(err));
            });
        });

        this.localStorage.get('hasPrompt').then( (val) => {
            this.hasPromptTransfer2IDChain = val ? val : false;
        });

        this.localStorage.getPublishTxList((publishTxList) => {
            if (publishTxList) {
                this.transactionMap = publishTxList;
            }
        });
    }

    successHandle(idList) {
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
                this.masterWallet[id] = this.masterInfos[id];
            }
            else {
                this.masterWallet[id] = { name: "walletName"};
            }
            this.getMasterWalletBasicInfo(id);
        }
    }

    public errorHandle(error) {
        this.native.hideLoading();
        if (error["code"] === 10002) {
            this.handleNull();
        }
    }

    handleNull() {
        this.native.setRootRouter('/launcher');
    }

    getCurMasterIdFromStorage() {
        this.localStorage.getCurMasterId((data) => {
            if (data && data["masterId"]) {
                this.masterIdFromStorage = data["masterId"];
            }
        });
    }

    getMasterWalletBasicInfo(masterId, isAdd = false) {
        console.log("Getting basic wallet info for wallet:", masterId);

        this.walletManager.getMasterWalletBasicInfo(masterId, (ret) => {
            this.masterWallet[masterId].account = ret;
            this.getAllSubWallets(masterId, isAdd);
        });
    }

    public getAllSubWallets(masterId, isAdd = false) {
        console.log("Getting all subwallets for wallet:", masterId, isAdd);

        this.walletManager.getAllSubWallets(masterId, (data) => {
            this.masterWallet[masterId].chainList = [];
            if (!this.masterWallet[masterId]["subWallet"]) {
                this.masterWallet[masterId].subWallet = {};
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
        });
    }

    public getWalletBalance(masterId, chainId) {
        this.walletManager.getBalance(masterId, chainId, (data: string) => {
            this.zone.run(() => {
                // balance in SELA
                this.masterWallet[masterId].subWallet[chainId].balance = parseInt(data, 10);
                let idChainBalance = 0;
                if (this.masterWallet[masterId].subWallet[Config.IDCHAIN]) {
                    idChainBalance = this.masterWallet[masterId].subWallet[Config.IDCHAIN].balance;
                }
                // rate = 1
                this.masterWallet[masterId].totalBalance = this.masterWallet[masterId].subWallet[Config.ELA].balance + idChainBalance;
            });
        });
    }

    public addMasterWallet(id, name) {
        this.masterWallet[id] = { name: name};
        this.masterList.push(id);
        this.getMasterWalletBasicInfo(id, true);
    }

    destroyMasterWallet(id) {
        this.walletManager.destroyWallet(id, () => {
            this.masterWallet[id] = null;
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
        });
    }

    public saveInfos() {
        this.localStorage.setMasterInfos(this.masterWallet);
    }

    private syncStartSubWallets(masterId) {
        if (masterId == "-1") {
            return;
        }

        for (var i = 0; i < this.masterWallet[masterId].chainList.length; i++) {
            var chainId = this.masterWallet[masterId].chainList[i];
            this.walletManager.syncStart(masterId, chainId, () => {});
        }
    }

    private syncStopSubWallets(masterId) {
        if (masterId == "-1") {
            return;
        }

        for (var i = 0; i < this.masterWallet[masterId].chainList.length; i++) {
            var chainId = this.masterWallet[masterId].chainList[i];
            this.walletManager.syncStop(masterId, chainId, () => {});
        }
    }

    public setCurMasterId(id) {
        if (id != this.curMasterId) {
            this.syncStopSubWallets(this.curMasterId);
            this.localStorage.saveCurMasterId({ masterId: id }).then((data) => {
                this.curMasterId = id;
                Config.curMaster = this.masterWallet[id];
                this.syncStartSubWallets(id);
                this.native.setRootRouter("/tabs");
            });
        }
    }

    public getCurMasterId() {
        return this.curMasterId;
    }

    public addSubWallet(masterId, chainId) {
        this.masterWallet[masterId].chainList.push(chainId);
        if (!this.masterWallet[masterId].subWallet[chainId]) {
            this.masterWallet[masterId].subWallet[chainId] = { balance: 0, lastblocktime: '',  timestamp: 0 };
        } else {
            if (this.progress && this.progress[masterId] && this.progress[masterId][chainId]) {
                const lastblocktime = this.progress[masterId][chainId].lastblocktime;
                if (lastblocktime) {
                    this.masterWallet[masterId].subWallet[chainId].lastblocktime = lastblocktime;
                    this.masterWallet[masterId].subWallet[chainId].timestamp = 0;
                }
            }
        }

        this.walletManager.registerWalletListener(masterId, chainId, (ret) => {
            this.zone.run(() => {
                this.handleSubWalletCallback(ret);
            });
        });
        this.getWalletBalance(masterId, chainId);
    }

    public removeSubWallet(masterId, chainId) {
        this.zone.run(() => {
            this.masterWallet[masterId].subWallet[chainId] = null;
            for (var i = 0; i < this.masterWallet[masterId].chainList.length; i++) {
                if (this.masterWallet[masterId].chainList[i] == chainId) {
                    this.masterWallet[masterId].chainList.splice(i, 1);
                    break;
                }
            }
            console.log(this.masterWallet[masterId]);
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
            this.popupProvider.ionicAlert_PublishedTx_fail('transaction-fail', tx + code, hash, reason);
            if (this.transactionMap[hash].lock !== true) {
                delete this.transactionMap[hash];
                this.localStorage.savePublishTxList(this.transactionMap);
            }
        }
    }

    public setProgress(masterId, coin, progress, lastBlockTime) {
        this.masterWallet[masterId].subWallet[coin].progress = progress;
        const datetime = Util.dateFormat(new Date(lastBlockTime * 1000), 'yyyy-MM-dd HH:mm:ss');
        this.masterWallet[masterId].subWallet[coin].lastblocktime = datetime;

        if (!this.progress[masterId]) {
            this.progress[masterId] = {};
        }
        if (!this.progress[masterId][coin]) {
            this.progress[masterId][coin] = {};
        }

        this.progress[masterId][coin].lastblocktime = datetime;
        this.localStorage.setProgress(this.progress);

        if (!this.hasPromptTransfer2IDChain && (coin === Config.IDCHAIN) && (progress === 100)) {
            this.checkIDChainBalance();
        }

        if (progress === 100) {
          this.sendSyncCompletedNotification(coin);
        }

        const curTimerstamp = (new Date()).getTime();
        // console.log('curTimerstamp ', curTimerstamp);
        if (curTimerstamp - this.masterWallet[masterId].subWallet[coin].timestamp > 5000) { // 5s
            this.events.publish(coin + ':syncprogress', {coin});
            this.masterWallet[masterId].subWallet[coin].timestamp = curTimerstamp;
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

        if (parseInt(this.masterWallet[this.curMasterId].subWallet[Config.ELA].balance, 10) <= 1000000) {
            console.log('ELA balance ', this.masterWallet[this.curMasterId].subWallet[Config.ELA].balance);
            return;
        }

        if (parseInt(this.masterWallet[this.curMasterId].subWallet[Config.IDCHAIN].balance, 10) > 100000) {
            console.log('IDChain balance ', this.masterWallet[this.curMasterId].subWallet[Config.IDCHAIN].balance);
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

        this.native.showLoading().then(() => {
            this.signAndSendTransaction(transfer);
        });
    }

    signAndSendTransaction(transfer) {
        this.walletManager.signTransaction(this.curMasterId,
                                           transfer.chainId,
                                           transfer.rawTransaction,
                                           transfer.payPassword, (signedTx: string) => {

            // if (this.walletInfo["Type"] === "Standard") {
                this.sendTransaction(transfer, signedTx);
            // } else if (this.walletInfo["Type"] === "Multi-Sign") {
            //     this.native.hideLoading();
            //     this.native.go("/scancode", { "tx": { "chainId": transfer.chainId, "fee": transfer.fee / Config.SELA, "raw": signedTx } });
            // }
        });
    }

    sendTransaction(transfer, signedTx) {
        // this.native.info(signedTx);
        this.walletManager.publishTransaction(this.curMasterId, transfer.chainId, signedTx, (ret) => {
            if (!Util.isEmptyObject(transfer.action)) {
                this.lockTx(ret.TxHash);
                setTimeout(() => {
                    let txId = ret.TxHash;
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
                console.log(ret.TxHash);
                this.native.hideLoading();
                this.native.toast_trans('send-raw-transaction');
                this.native.setRootRouter('/tabs');
            }
        });
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
