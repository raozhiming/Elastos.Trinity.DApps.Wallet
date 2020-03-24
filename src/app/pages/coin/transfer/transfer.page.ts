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

import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events } from '@ionic/angular';
import { AppService, ScanType } from '../../../services/AppService';
import { Config } from '../../../services/Config';
import { Native } from '../../../services/Native';
import { Util } from '../../../services/Util';
import { WalletManager } from '../../../services/WalletManager';

declare let appManager: AppManagerPlugin.AppManager;

@Component({
    selector: 'app-transfer',
    templateUrl: './transfer.page.html',
    styleUrls: ['./transfer.page.scss'],
})
export class TransferPage implements OnInit, OnDestroy {
    masterWalletId = '1';
    walletType = '';
    transfer: any = null;

    chainId: string;

    Config = Config;
    SELA = Config.SELA;
    walletInfo = {};

    transFunction: any;
    readonly = false;
    hideMemo = false;
    introText = ''; // to show intro text

    constructor(public route: ActivatedRoute, public walletManager: WalletManager, public appService: AppService,
                public native: Native, public events: Events, public zone: NgZone) {
        this.init();
    }

    ngOnInit() {
    }

    ionViewDidEnter() {
        appManager.setVisible("show", ()=>{}, (err)=>{});
    }

    ngOnDestroy() {
        this.events.unsubscribe('address:update');
    }

    init() {
        // console.log(Config.coinObj);
        this.transfer = Config.coinObj.transfer;
        this.chainId = Config.coinObj.chainId;
        this.walletInfo = Config.coinObj.walletInfo;
        this.events.subscribe('address:update', (address) => {
            this.zone.run(() => {
                this.transfer.toAddress = address;
            });
        });
        this.masterWalletId = Config.getCurMasterWalletId();
        switch (this.transfer.type) {
            case 'payment-confirm':
                this.readonly = true;
            case 'transfer':
                this.transFunction = this.createTransaction;
                break;
            case 'recharge':
                this.transFunction = this.createDepositTransaction;
                this.transfer.rate = 1; // TODO:: this is sidechain rate
                this.transfer.fee = 10000;
                this.chainId = 'ELA';
                this.transfer.amount = '0.1'; // for DID
                this.getAddress(Config.IDCHAIN);
                this.hideMemo = true;
;               this.introText = 'text-recharge-intro';
                break;
            case 'withdraw':
                this.transFunction = this.createWithdrawTransaction;
                this.transfer.rate = 1; // TODO:: this is mainchain rate
                this.getAddress('ELA');
                this.hideMemo = true;
                break;
        }
    }

    getAddress(chainId: string) {
        this.walletManager.createAddress(this.masterWalletId, chainId, (ret) => {
            this.transfer.toAddress = ret;
        });
    }

    rightHeader() {
        this.appService.scan(ScanType.Address);
    }

    goContact() {
        this.native.go("/contact-list", { "hideButton": true });
    }

    goTransaction() {
        this.checkValue();
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

        if (this.transfer.amount * this.SELA > Config.curMaster.subWallet[this.chainId].balance) {
            this.native.toast_trans('error-amount');
            return;
        }

        if (this.transfer.amount.toString().indexOf('.') > -1 && this.transfer.amount.toString().split(".")[1].length > 8) {
            this.native.toast_trans('correct-amount');
            return;
        }

        this.walletManager.isAddressValid(this.masterWalletId, this.transfer.toAddress,
            () => { this.transFunction(); },
            () => { this.native.toast_trans('contact-address-digits'); }
        );
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
            toAmount.toString(),
            this.transfer.memo,
            (data) => {
                this.transfer.rawTransaction = data;
                Config.masterManager.openPayModal(this.transfer);
            });
    }

    createDepositTransaction() {
        let toAmount = this.accMul(this.transfer.amount, Config.SELA);
        this.walletManager.createDepositTransaction(this.masterWalletId, 'ELA', "",
            Config.coinObj.chainId,
            toAmount.toString(), // user input amount
            this.transfer.toAddress, // user input address
            this.transfer.memo,
            (data) => {
                this.transfer.rawTransaction = data;
                Config.masterManager.openPayModal(this.transfer);
            });
    }

    createWithdrawTransaction() {
        let toAmount = this.accMul(this.transfer.amount, Config.SELA);
        this.walletManager.createWithdrawTransaction(this.masterWalletId, this.chainId, "",
            toAmount.toString(),
            this.transfer.toAddress,
            this.transfer.memo,
            (data) => {
                this.transfer.rawTransaction = data;
                Config.masterManager.openPayModal(this.transfer);
            });
    }
}
