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
import { AppService } from '../../../services/AppService';
import { Config } from '../../../services/Config';
import { Native } from '../../../services/Native';
import { PopupProvider } from '../../../services/popup';
import { WalletManager } from '../../../services/WalletManager';

declare let appManager: AppManagerPlugin.AppManager;

@Component({
    selector: 'app-crmemberregister',
    templateUrl: './crmemberregister.page.html',
    styleUrls: ['./crmemberregister.page.scss'],
})
export class CrmemberregisterPage implements OnInit {
    masterWalletId = '1';
    transfer: any = null;

    balance: number; // ELA

    chainId: string; // IDChain
    hasOpenIDChain = false;
    walletInfo = {};

    transFunction: any;
    title = '';
    info = '';

    private depositAmount = '500000000000'; // 5000 ELA

    constructor(public walletManager: WalletManager,
                public appService: AppService,
                public popupProvider: PopupProvider,
                public native: Native, public zone: NgZone) {
        this.init();
        // TODO: upgrade spv sdk and test
    }

    ngOnInit() {
    }

    ionViewDidEnter() {
        if (this.walletInfo["Type"] === "Multi-Sign") {
            // TODO: reject didtransaction if multi sign (show error popup)
            this.appService.close();
        }

        appManager.setVisible("show", () => { }, (err) => { });
    }

    init() {
        this.transfer = Config.coinObj.transfer;
        this.chainId = Config.coinObj.transfer.chainId;
        this.walletInfo = Config.coinObj.walletInfo;
        this.masterWalletId = Config.getCurMasterWalletId();

        switch (this.transfer.action) {
            case 'crmemberregister':
                this.transFunction = this.createRegisterCRTransaction;
                this.title = 'text-crmember-register';
                this.info = 'text-you-are-going-to-register-crmember';
                break;
            case 'crmemberupdate':
                this.transFunction = this.createUpdateCRTransaction;
                this.title = 'text-crmember-update';
                this.info = 'text-you-are-going-to-update-crmember';
                break;
            case 'crmemberunregister':
                this.transFunction = this.createUnregisterCRTransaction;
                this.title = 'text-crmember-unregister';
                this.info = 'text-you-are-going-to-unregister-crmember';
                break;
            case 'crmemberretrieve':
                this.transFunction = this.createRegisterCRTransaction;
                this.title = 'text-crmember-retrieve';
                this.info = 'text-you-are-going-to-uretrive-deposit';
                break;
            default:
                break;
        }

        const coinList = Config.getSubWalletList();
        if (coinList.length === 1) { // for now, just IDChain
            this.hasOpenIDChain = true;
            this.balance = Config.masterManager.masterWallet[this.masterWalletId].subWallet[this.chainId].balance / Config.SELA;
        } else {
            this.hasOpenIDChain = false;
            this.confirmOpenIDChain();
        }
    }

    /**
     * Cancel the vote operation. Closes the screen and goes back to the calling application after
     * sending the intent response.
     */
    cancelOperation() {
        this.appService.sendIntentResponse(this.transfer.action, { txid: null }, this.transfer.intentId);
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

        if (this.balance < 0.0002) {
            this.popupProvider.ionicAlert('confirmTitle', 'text-did-balance-not-enough');
            return;
        }

        this.transFunction();
    }

    async createRegisterCRTransaction() {
        console.log('Calling createRegisterCRTransaction()');

        const crPublickeys = await this.walletManager.getAllPublicKeys(this.masterWalletId, Config.IDCHAIN, 0, 1);
        const crPublicKey = crPublickeys.PublicKeys[0];

        const payload = await this.walletManager.generateCRInfoPayload(this.masterWalletId, this.chainId,
                crPublicKey, this.transfer.did, this.transfer.nickName, this.transfer.url, this.transfer.location);
        const digest = payload.Digest;

        const payPassword = await Config.masterManager.getPassword(this.transfer);
        if (payPassword === null) {// cancle by user
            return;
        }
        this.transfer.payPassword = payPassword;

        this.walletManager.didSignDigest(this.masterWalletId,
                this.transfer.did, digest, payPassword, async (signature) => {
            payload.Signature = signature;
            this.transfer.rawTransaction  = await this.walletManager.createRegisterCRTransaction(this.masterWalletId, this.chainId,
                    '', payload, this.depositAmount, this.transfer.memo);
            Config.masterManager.openPayModal(this.transfer);
        });
    }

    async createUpdateCRTransaction() {
        console.log('Calling createUpdateCRTransaction()');

        const payload = await this.walletManager.generateCRInfoPayload(this.masterWalletId,
                this.chainId, this.transfer.crPublicKey, this.transfer.did, this.transfer.nickname,
                this.transfer.url, this.transfer.location);
        this.transfer.rawTransaction  = await this.walletManager.createUpdateCRTransaction(this.masterWalletId, this.chainId,
                '', payload, this.transfer.memo);
        Config.masterManager.openPayModal(this.transfer);
    }

    async createUnregisterCRTransaction() {
        console.log('Calling createUnregisterCRTransaction()');

        const payload = await this.walletManager.generateUnregisterCRPayload(this.masterWalletId, this.chainId,
                this.transfer.crDID);
        this.transfer.rawTransaction  = await this.walletManager.createUnregisterCRTransaction(this.masterWalletId, this.chainId,
                '', payload, this.transfer.memo);
        Config.masterManager.openPayModal(this.transfer);
    }

    async createRetrieveCRDepositTransaction() {
        console.log('Calling createRetrieveCRDepositTransaction()');

        this.transfer.rawTransaction  = await this.walletManager.createRetrieveCRDepositTransaction(this.masterWalletId, this.chainId,
            this.transfer.crPublickey, this.transfer.acount, this.transfer.memo);
        Config.masterManager.openPayModal(this.transfer);
    }
}
