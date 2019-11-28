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
import { WalletManager } from '../../../services/WalletManager';
import { Native } from '../../../services/Native';
import { ActivatedRoute } from '@angular/router';
import { LocalStorage } from '../../../services/Localstorage';
import { Util } from "../../../services/Util";
import { Config } from '../../../services/Config';
import { ModalController, Events } from '@ionic/angular';
import { PaymentboxComponent } from '../../../components/paymentbox/paymentbox.component';
import { AppService } from '../../../services/AppService';

@Component({
    selector: 'app-dposvote',
    templateUrl: './dposvote.page.html',
    styleUrls: ['./dposvote.page.scss'],
})
export class DPoSVotePage implements OnInit {
    masterWalletId: string = "1";
    transfer: any = null;

    balance = 0;

    chainId: string;

    rawTransaction: '';

    genesisAddress: '';

    SELA = Config.SELA;
    appType: string = null;
    selectType: string = "";
    parms: any;
    txId: string;
    did: string;
    isInput = false;
    walletInfo = {};
    useVotedUTXO: boolean = false;

    transFunction: any;
    readonly: boolean = false;

    constructor(public route: ActivatedRoute, public walletManager: WalletManager, public appService: AppService,
        public native: Native, public localStorage: LocalStorage, public modalCtrl: ModalController, public events: Events, public zone: NgZone) {
        this.init();
    }

    ngOnInit() {
    }

    // ionViewDidLeave() {
    //    this.events.unsubscribe("error:update");
    // }

    init() {
        console.log(Config.coinObj);
        this.transfer = Config.coinObj.transfer;
        this.chainId = Config.coinObj.chainId;
        this.walletInfo = Config.coinObj.walletInfo;
        this.events.subscribe("address:update", (address) => {
            this.transfer.toAddress = address;
        });
        this.masterWalletId = Config.getCurMasterWalletId();
        switch (this.transfer.type) {
            case "vote-UTXO":
                this.transFunction = this.createVoteProducerTransaction;
                this.transfer.amount = this.balance;
                break;
        }
        this.initData();
    }

    rightHeader() {
        // console.log(Config.coinObj.transfer);
        this.native.go("/scan", { "pageType": "1" });
    }

    /**
     * Cancel the vote operation. Closes the screen and goes back to the calling application after
     * sending the intent response.
     */
    cancelOperation() {
        this.appService.sendIntentResponse(this.transfer.action, {txid: null}, this.transfer.intentId);
    }

    goTransaction() {
        this.checkValue();
    }

    initData() {
        this.walletManager.getBalance(this.masterWalletId, this.chainId, Config.total, (ret) => {
            this.balance = ret;
        });
    }

    checkValue() {
        if (Util.isNull(this.transfer.toAddress)) {
            this.native.toast_trans('correct-address');
            return;
        }
        if (Util.isNull(this.transfer.amount)) {
            this.native.toast_trans('amount-null');
            return;
        }
        if (!Util.number(this.transfer.amount)) {
            this.native.toast_trans('correct-amount');
            return;
        }

        if (this.transfer.amount <= 0) {
            this.native.toast_trans('correct-amount');
            return;
        }

        if (this.transfer.amount > this.balance) {
            this.native.toast_trans('error-amount');
            return;
        }

        if (this.transfer.amount.toString().indexOf(".") > -1 && this.transfer.amount.toString().split(".")[1].length > 8) {
            this.native.toast_trans('correct-amount');
            return;
        }

        this.walletManager.isAddressValid(this.masterWalletId, this.transfer.toAddress,
            () => { this.transFunction(); },
            () => { this.native.toast_trans("contact-address-digits"); }
        );
    }

    async openPayModal(transfer) {
        let props = this.native.clone(transfer);
        const modal = await this.modalCtrl.create({
            component: PaymentboxComponent,
            componentProps: props
        });
        modal.onDidDismiss().then((params) => {
            if (params.data) {
                this.native.showLoading().then(() => {
                    this.transfer.payPassword = params.data;
                    // console.log(params.data);
                    this.signTx();
                });
            }
        });
        return modal.present();
    }

    accMul(arg1, arg2) {
        let m = 0, s1 = arg1.toString(), s2 = arg2.toString();
        try { m += s1.split(".")[1].length } catch (e) { }
        try { m += s2.split(".")[1].length } catch (e) { }
        return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
    }

    createTransaction() {
        let toAmount = this.accMul(this.transfer.amount, Config.SELA);
        let me = this;

        this.walletManager.createTransaction(this.masterWalletId, this.chainId, "",
            this.transfer.toAddress,
            toAmount,
            this.transfer.memo,
            this.useVotedUTXO,
            (data) => {
                me.rawTransaction = data;
                me.openPayModal(me.transfer);
            });
    }

    createVoteProducerTransaction() {
        let toAmount = this.accMul(this.transfer.amount, Config.SELA);
        if (this.transfer.toAddress == "default") {
            this.transfer.toAddress = "";
        }

        this.walletManager.createVoteProducerTransaction(this.masterWalletId, this.chainId,
            this.transfer.toAddress,
            toAmount,
            this.transfer.publicKeys,
            this.transfer.memo,
            true,
            (data) => {
                this.rawTransaction = data;
                this.openPayModal(this.transfer);
            });
    }

    signTx() {
        this.walletManager.signTransaction(this.masterWalletId, this.chainId, this.rawTransaction, this.transfer.payPassword, (ret) => {
            if (this.walletInfo["Type"] === "Standard") {
                this.sendTx(ret);
            }
            else if (this.walletInfo["Type"] === "Multi-Sign") {
                this.native.hideLoading();
                this.native.go("/scancode", { "tx": { "chainId": this.chainId, "fee": this.transfer.fee / Config.SELA, "raw": ret } });
            }
        });
    }

    sendTx(rawTransaction) {
        this.native.info(rawTransaction);
        this.walletManager.publishTransaction(this.masterWalletId, this.chainId, rawTransaction, (ret) => {
            this.native.hideLoading();
            this.native.toast_trans('send-raw-transaction');
            this.native.setRootRouter("/tabs");
            switch (this.transfer.type) {
                case "payment-confirm":
                case "vote-UTXO":
                case "did-confirm":
                    this.appService.sendIntentResponse(this.transfer.action, {txid: ret.TxHash}, this.transfer.intentId);
                break;
            }
            console.log(ret.TxHash);
        })
    }
}

