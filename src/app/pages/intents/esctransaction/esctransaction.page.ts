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
import { AppService } from '../../../services/app.service';
import { Config } from '../../../config/Config';
import { Native } from '../../../services/native.service';
import { PopupProvider } from '../../../services/popup.service';
import { WalletManager } from '../../../services/wallet.service';
import { MasterWallet } from 'src/app/model/MasterWallet';
import { CoinTransferService } from 'src/app/services/cointransfer.service';
import { StandardCoinName } from 'src/app/model/Coin';
import { IntentService } from 'src/app/services/intent.service';
import { ThemeService } from 'src/app/services/theme.service';

declare let appManager: AppManagerPlugin.AppManager;

@Component({
    selector: 'app-esctransaction',
    templateUrl: './esctransaction.page.html',
    styleUrls: ['./esctransaction.page.scss'],
})
export class EscTransactionPage implements OnInit {
    masterWallet: MasterWallet = null;
    transfer: any = null;

    balance: number; // ELA

    chainId: string; // ETHSC
    hasOpenETHSCChain = false;
    walletInfo = {};

    constructor(
        public walletManager: WalletManager,
        public appService: AppService,
        public popupProvider: PopupProvider,
        private coinTransferService: CoinTransferService,
        private intentService: IntentService,
        public native: Native,
        public zone: NgZone,
        public theme: ThemeService
    ) {
        // this.init();
    }

    ngOnInit() {
    }

    ionViewDidEnter() {
      if (this.walletInfo["Type"] === "Multi-Sign") {
          // TODO: reject esctransaction if multi sign (show error popup)
          this.appService.close();
      }

      appManager.setVisible("show");
    }

    async init() {
        this.transfer = this.coinTransferService.transfer;
        this.chainId = this.coinTransferService.transfer.chainId;
        this.walletInfo = this.coinTransferService.walletInfo;
        this.masterWallet = this.walletManager.getActiveMasterWallet();
        
        if (this.chainId === StandardCoinName.ETHSC && !this.masterWallet.hasSubWallet(StandardCoinName.ETHSC)) {
            await this.notifyNoETHSCChain();
            this.cancelOperation();
            return;
        }
    }

    /**
     * Cancel the vote operation. Closes the screen and goes back to the calling application after
     * sending the intent response.
     */
    cancelOperation() {
        this.intentService.sendIntentResponse(this.transfer.action, {txid: null}, this.transfer.intentId);
        this.appService.close();
    }

    goTransaction() {
        this.checkValue();
    }

    notifyNoETHSCChain() {
        return this.popupProvider.ionicAlert('confirmTitle', 'no-open-side-chain');
    }

    checkValue() {
        if (this.balance < 0.0002) {
            this.popupProvider.ionicAlert('confirmTitle', 'text-did-balance-not-enough');
            return;
        }

        this.createEscTransaction();
    }

    async createEscTransaction() {
        console.log("Calling createEscTransaction(): ", this.transfer.didrequest, this.transfer.memo)
        
       /* TODO this.transfer.rawTransaction = await this.walletManager.spvBridge.createTransaction(
            this.masterWallet.id, 
            this.chainId,
            this.transfer.escrequest,
            amount,
            this.transfer.memo);
            
        console.log("Created raw ESC transaction:", this.transfer.rawTransaction);
        
        this.walletManager.openPayModal(this.transfer);*/
    }
}

