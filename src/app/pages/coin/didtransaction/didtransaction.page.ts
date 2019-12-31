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
import { ModalController, Events } from '@ionic/angular';
import { PaymentboxComponent } from '../../../components/paymentbox/paymentbox.component';
import { AppService } from '../../../services/AppService';
import { Config } from '../../../services/Config';
import { Native } from '../../../services/Native';
import { PopupProvider } from '../../../services/popup';
import { WalletManager } from '../../../services/WalletManager';

@Component({
    selector: 'app-didtransaction',
    templateUrl: './didtransaction.page.html',
    styleUrls: ['./didtransaction.page.scss'],
})
export class DidtransactionPage implements OnInit {
    masterWalletId = '1';
    transfer: any = null;

    balance = 0;

    chainId: string;
    rawTransaction: '';
    txId: string;
    hasOpenIDChain = false;
    walletInfo = {};

    constructor(public walletManager: WalletManager, public appService: AppService, public popupProvider: PopupProvider,
                public native: Native, public modalCtrl: ModalController, public zone: NgZone) {
        this.init();
    }

    ngOnInit() {
    }

    ionViewDidEnter() {
      if (this.walletInfo["Type"] === "Multi-Sign") {
          // TODO: reject didtransaction if multi sign (show error popup)
          this.appService.close();
      }
    }

    init() {
        console.log(Config.coinObj);
        this.transfer = Config.coinObj.transfer;
        this.chainId = Config.coinObj.chainId;
        this.walletInfo = Config.coinObj.walletInfo;
        this.masterWalletId = Config.getCurMasterWalletId();
        if (this.chainId === 'ELA') {
            let coinList = Config.getSubWalletList();
            if (coinList.length === 1) {
                this.chainId = coinList[0].name;
                this.hasOpenIDChain = true;
                this.fetchBalance();
            } else {
                this.hasOpenIDChain = false;
                this.confirmOpenIDChain();
            }
        }
    }

    fetchBalance() {
        this.walletManager.getBalance(this.masterWalletId, this.chainId, (ret) => {
            this.balance = ret / Config.SELA;
        });
    }

    /**
     * Cancel the vote operation. Closes the screen and goes back to the calling application after
     * sending the intent response.
     */
    cancelOperation() {
        this.appService.sendIntentResponse(this.transfer.action, {txid: null}, this.transfer.intentId);
        this.appService.close();
    }

    goTransaction() {
        this.checkValue();
    }

    confirmOpenIDChain() {
        if (!this.hasOpenIDChain) {
            this.popupProvider.ionicAlert('confirmTitle', 'no-open-side-chain');
        }
        return this.hasOpenIDChain;
    }
    checkValue() {
        if (!this.confirmOpenIDChain()) {
            return;
        }
        if (this.balance < 20000) {// sela
            this.native.toast_trans('text-did-balance-not-enoug');
            return;
        }

        this.createIDTransaction();
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

    createIDTransaction() {
        console.log("Calling createIdTransaction(): ", this.transfer.didrequest, this.transfer.memo)
        this.walletManager.createIdTransaction(this.masterWalletId, this.chainId,
            this.transfer.didrequest,
            this.transfer.memo,
            (data) => {
                console.log("Created raw DID transaction:", data);
                this.rawTransaction = data;
                this.openPayModal(this.transfer);
            });
    }

    signTx() {
        this.walletManager.signTransaction(this.masterWalletId, this.chainId, this.rawTransaction, this.transfer.payPassword, (ret) => {
            this.sendTx(ret);
        });
    }

    sendTx(rawTransaction) {
        this.native.info(rawTransaction);
        this.walletManager.publishTransaction(this.masterWalletId, this.chainId, rawTransaction, (ret) => {
            this.native.hideLoading();
            this.native.toast_trans('send-raw-transaction');
            this.native.setRootRouter('/tabs');

            this.appService.sendIntentResponse(this.transfer.action, {txid: ret.TxHash}, this.transfer.intentId);
            console.log(ret.TxHash);
        });
    }
}

