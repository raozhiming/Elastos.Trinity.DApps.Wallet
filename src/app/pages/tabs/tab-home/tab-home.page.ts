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

import { Component, OnInit, NgZone } from '@angular/core';
import { Config } from '../../../services/Config';
import { Util } from '../../../services/Util';
import { Events } from '@ionic/angular';
import { WalletManager } from '../../../services/WalletManager';
import { Native } from '../../../services/Native';
import { LocalStorage } from '../../../services/Localstorage';
import { PopupProvider } from "../../../services/popup";

@Component({
    selector: 'app-tab-home',
    templateUrl: './tab-home.page.html',
    styleUrls: ['./tab-home.page.scss'],
})
export class TabHomePage implements OnInit {
    masterWalletId: string = "1";
    elaPer: any;
    idChainPer: any;
    walletName = 'myWallet';
    showOn: boolean = true;
    ElaObj = { "name": "ELA", "balance": 0 };
    coinList = [];
    account: any = {};
    elaMaxHeight: any;
    elaCurHeight: any;
    idChainMaxHeight: any;
    idChainCurHeight: any;
    constructor(
        public walletManager: WalletManager,
        public native: Native,
        public localStorage: LocalStorage, public zone: NgZone, public events: Events, public popupProvider: PopupProvider) {
        // this.init();
    }

    ngOnInit() {
    }

    ionViewWillEnter() {
        if (Config.initialized) {
            this.events.subscribe("wallet:update", (id) => {
                this.init();
            });
            this.events.subscribe("register:update", (walletId, coin, result) => {
                if (result["MasterWalletID"] === this.masterWalletId && result["ChaiID"] === "ELA") {
                    this.handleEla(result);
                }

                if (result["MasterWalletID"] === this.masterWalletId && result["ChaiID"] === "IDChain") {
                    this.handleIdchain(coin, result);
                }
            });
            this.init();
        }
    }

    ionViewDidLeave() {
        this.events.unsubscribe("register:update");
        this.events.unsubscribe("wallet:update");
    }

    init() {
        this.masterWalletId = Config.getCurMasterWalletId();
        this.account = Config.getAccountType(this.masterWalletId);
        this.walletName = Config.getWalletName(this.masterWalletId);

        this.goPayment();
        this.zone.run(() => {
            //this.elaPer = Config.getMasterPer(this.masterWalletId,"ELA");;
            this.elaMaxHeight = Config.getEstimatedHeight(this.masterWalletId, "ELA");
            this.elaCurHeight = Config.getCurrentHeight(this.masterWalletId, "ELA");
            this.idChainMaxHeight = Config.getEstimatedHeight(this.masterWalletId, "IDChain");
            this.idChainCurHeight = Config.getCurrentHeight(this.masterWalletId, "IDChain");
            //this.idChainPer = Config.getMasterPer(this.masterWalletId,"IDChain");
        });
        this.getAllSubWallets();
    }

    onOpen() {
        this.showOn = !this.showOn;
    }

    goPayment() {
        this.localStorage.get('payment').then((val) => {
            if (val) {
                this.localStorage.remove('payment');
                this.native.go("/payment-confirm", JSON.parse(val));
            }
        });
    }

    onClick() {
        event.stopPropagation();
        return false;
    }

    onItem(item) {
        this.native.go("/coin", { name: item.name, "elaPer": this.elaPer, "idChainPer": this.idChainPer });
    }

    getElaBalance(item) {
        this.walletManager.getBalance(this.masterWalletId, item.name, Config.total, (ret) => {
            if (!Util.isNull(ret)) {
                this.zone.run(() => {
                    this.ElaObj.balance = Util.scientificToNumber(ret / Config.SELA);
                });
            }
        });
    }

    getAllSubWallets() {
        this.getElaBalance(this.ElaObj);
        this.handleSubwallet();
    }

    getSubBalance(coin) {
        this.walletManager.getBalance(this.masterWalletId, coin, Config.total, (ret) => {
            if (!Util.isNull(ret)) {
                var balance = parseInt(ret);
                if (this.coinList.length === 0) {
                    this.coinList.push({ name: coin, balance: balance / Config.SELA });
                }
                else {
                    let index = this.getCoinIndex(coin);
                    if (index != -1) {
                        let item = this.coinList[index];
                        item["balance"] = balance / Config.SELA;
                        this.coinList.splice(index, 1, item);

                    }
                    else {
                        this.coinList.push({ name: coin, balance: balance / Config.SELA });
                    }
                }
            }
        });
    }

    getCoinIndex(coin) {
        for (let index = 0; index < this.coinList.length; index++) {
            let item = this.coinList[index];
            if (coin === item["name"]) {
                return index;
            }
        }
        return -1;
    }

    handleSubwallet() {
        let subwall = Config.getSubWallet(this.masterWalletId);

        if (subwall) {
            if (Util.isEmptyObject(subwall)) {
                this.coinList = [];
                return;
            }
            for (let coin in subwall) {
                //this.sycIdChain(coin);
                this.getSubBalance(coin);
            }

        } else {
            this.coinList = [];
        }
    }

    OnTxPublished(data) {
        let hash = data["hash"];
        let result = JSON.parse(data["result"]);
        let code = result["Code"];
        let tx = "txPublished-"
        switch (code) {
            case 0:
            case 18:
                this.popupProvider.ionicAlert_PublishedTx_sucess('confirmTitle', tx + code, hash);
                break;
            case 1:
            case 16:
            case 17:
            case 22:
            case 64:
            case 65:
            case 66:
            case 67:
                this.popupProvider.ionicAlert_PublishedTx_fail('confirmTitle', tx + code, hash);
                break;
        }
    }

    handleEla(result) {
        switch (result["Action"]) {
            case "OnTransactionStatusChanged":
                this.native.info(result['confirms']);
                if (result['confirms'] == 1) {
                    this.getElaBalance(this.ElaObj);
                    this.popupProvider.ionicAlert('confirmTitle', 'confirmTransaction').then((data) => {
                    });
                }
                break;
            case "OnBlockSyncStarted":
                this.zone.run(() => {
                    //this.elaPer = Config.getMasterPer(this.masterWalletId,"ELA");
                    this.elaMaxHeight = Config.getEstimatedHeight(this.masterWalletId, "ELA");
                    this.elaCurHeight = Config.getCurrentHeight(this.masterWalletId, "ELA");
                });
                break;
            case "OnBlockSyncProgress":
                this.zone.run(() => {
                    this.elaMaxHeight = result["estimatedHeight"];
                    this.elaCurHeight = result["currentBlockHeight"];
                    //Config.setMasterPer(this.masterWalletId,"ELA",this.elaPer);
                    Config.setCureentHeight(this.masterWalletId, "ELA", this.elaCurHeight);
                    Config.setEstimatedHeight(this.masterWalletId, "ELA", this.elaMaxHeight);
                    this.localStorage.setProgress(Config.perObj);
                });
                break;
            case "OnBlockSyncStopped":
                this.zone.run(() => {
                    //this.elaPer = Config.getMasterPer(this.masterWalletId,"ELA");
                    this.elaMaxHeight = Config.getEstimatedHeight(this.masterWalletId, "ELA");
                    this.elaCurHeight = Config.getCurrentHeight(this.masterWalletId, "ELA");
                });
                break;
            case "OnBalanceChanged":
                if (!Util.isNull(result["Balance"])) {
                    this.zone.run(() => {
                        this.ElaObj.balance = Util.scientificToNumber(result["Balance"] / Config.SELA);
                    });
                }
                break;
            case "OnTxPublished":
                this.OnTxPublished(result);
                break;
            case "OnAssetRegistered":
                break;
            case "OnConnectStatusChanged":
                break;
        }
    }


    handleIdchain(coin, result) {

        switch (result["Action"]) {
            case "OnTransactionStatusChanged":
                if (result['confirms'] == 1) {
                    this.handleSubwallet();
                    this.popupProvider.ionicAlert('confirmTitle', 'confirmTransaction').then((data) => {
                    });
                }
                break;
            case "OnBlockSyncStarted":
                this.zone.run(() => {
                    //this.idChainPer = Config.getMasterPer(this.masterWalletId,coin);
                    this.idChainMaxHeight = Config.getEstimatedHeight(this.masterWalletId, "IDChain");
                    this.idChainCurHeight = Config.getCurrentHeight(this.masterWalletId, "IDChain");
                });
                break;
            case "OnBlockSyncProgress":
                this.zone.run(() => {
                    //this.idChainPer  = result["progress"];
                    this.idChainMaxHeight = result["estimatedHeight"];
                    this.idChainCurHeight = result["currentBlockHeight"];
                    //Config.setMasterPer(this.masterWalletId,coin,this.idChainPer);
                    Config.setCureentHeight(this.masterWalletId, coin, this.idChainCurHeight);
                    Config.setEstimatedHeight(this.masterWalletId, coin, this.idChainMaxHeight);
                    this.localStorage.setProgress(Config.perObj);
                });
                break;
            case "OnBlockSyncStopped":
                this.zone.run(() => {
                    //this.idChainPer = Config.getMasterPer(this.masterWalletId,coin);
                    this.idChainMaxHeight = Config.getEstimatedHeight(this.masterWalletId, "IDChain");
                    this.idChainCurHeight = Config.getCurrentHeight(this.masterWalletId, "IDChain");
                });
                break;
            case "OnBalanceChanged":
                if (!Util.isNull(result["Balance"])) {
                    if (this.coinList.length === 0) {
                        this.coinList.push({ name: coin, balance: Util.scientificToNumber(result["Balance"] / Config.SELA) });
                    }
                    else {
                        let index = this.getCoinIndex(coin);
                        if (index != -1) {
                            let item = this.coinList[index];
                            item["balance"] = Util.scientificToNumber(result["Balance"] / Config.SELA);
                            this.coinList.splice(index, 1, item);

                        }
                        else {
                            this.coinList.push({ name: coin, balance: Util.scientificToNumber(result["Balance"] / Config.SELA) });
                        }
                    }
                }
                break;
            case "OnTxPublished":
                this.OnTxPublished(result);
                break;
            case "OnAssetRegistered":
                break;
            case "OnConnectStatusChanged":
                break;
        }
    }

    doRefresh(event) {
        //this.init();
        this.getElaBalance(this.ElaObj);
        this.handleSubwallet();
        setTimeout(() => {
            event.target.complete();
        }, 1000);
    }
}
