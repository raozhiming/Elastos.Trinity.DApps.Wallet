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
import { CoinTransferService, IntentTransfer, Transfer } from 'src/app/services/cointransfer.service';
import { IntentService } from 'src/app/services/intent.service';
import { ThemeService } from 'src/app/services/theme.service';
import { TranslateService } from '@ngx-translate/core';

declare let appManager: AppManagerPlugin.AppManager;

@Component({
    selector: 'app-dposvote',
    templateUrl: './dposvote.page.html',
    styleUrls: ['./dposvote.page.scss'],
})
export class DPoSVotePage implements OnInit {

    private masterWalletId: string;
    public balance: string; // Balance in SELA
    public chainId: string;
    private walletInfo = {};
    public intentTransfer: IntentTransfer;

    constructor(
        public walletManager: WalletManager,
        public appService: AppService,
        public coinTransferService: CoinTransferService,
        private intentService: IntentService,
        public native: Native,
        public zone: NgZone,
        public popupProvider: PopupProvider,
        public theme: ThemeService,
        private translate: TranslateService,
    ) {
        this.init();
    }

    ngOnInit() {
    }

    ionViewWillEnter() {
        this.appService.setTitleBarTitle(this.translate.instant('dposvote-title'));
        appManager.setVisible("show", () => {}, (err) => {});
    }

    ionViewDidEnter() {
        if (this.walletInfo["Type"] === "Multi-Sign") {
            // TODO: reject voting if multi sign (show error popup), as multi sign wallets cannot vote.
            this.appService.close();
        }
    }

    init() {
        this.chainId = this.coinTransferService.chainId;
        this.intentTransfer = this.coinTransferService.intentTransfer;
        this.walletInfo = this.coinTransferService.walletInfo;
        this.masterWalletId = this.coinTransferService.masterWalletId;
        this.fetchBalance();

        this.hasPendingVoteTransaction();
    }

    async fetchBalance() {
        const balance = await this.walletManager.spvBridge.getBalance(this.masterWalletId, this.chainId);
        this.zone.run(() => {
            console.log("Received balance:", balance);
            this.balance = balance;
        });
    }

    async hasPendingVoteTransaction() {
        const jsonInfo = await this.walletManager.spvBridge.getBalanceInfo(this.masterWalletId, this.chainId);
        const balanceInfo = JSON.parse(jsonInfo);

        // TODO: replace line below with a real BalanceInfo type (to be descypted manually, doesn't exist)
        if (balanceInfo[0]['Summary']['SpendingBalance'] !== '0') {
            await this.popupProvider.ionicAlert('confirmTitle', 'test-vote-pending');
            this.cancelOperation();
        }
    }

    /**
     * Cancel the vote operation. Closes the screen and goes back to the calling application after
     * sending the intent response.
     */
    async cancelOperation() {
        await this.intentService.sendIntentResponse(
            this.intentTransfer.action,
            { txid: null, status: 'cancelled' },
            this.intentTransfer.intentId);

        this.appService.close();
    }

    goTransaction() {
        this.checkValue();
    }

    async checkValue() {
        if (this.getBalanceInELA() === 0) {
            this.native.toast_trans('amount-null');
            return;
        }

        try {
            await this.walletManager.spvBridge.isAddressValid(this.masterWalletId, 'default');
            this.createVoteProducerTransaction();
        } catch (error) {
            this.native.toast_trans('contact-address-digits');
        }
    }

    elaToSELAString(elaAmount: number) {
        const integerPart = Math.trunc(elaAmount);
        const fracPart = elaAmount - integerPart;
        const integerPartString = integerPart.toString();
        const fracPartString = Math.trunc(fracPart * Config.SELA).toString();

        return integerPartString + fracPartString;
    }

    // 15950000000 SELA will give 159.5 ELA
    // We need to use this trick because JS is limited to 2^53 bits numbers and this could create
    // problems with big ELA amounts.
    getBalanceInELA(): number {
        if (!this.balance) {
            return 0;
        }

        const strSizeOfSELA = 8;
        const leftPart = this.balance.substr(0, this.balance.length - strSizeOfSELA);
        const rightPart = this.balance.substr(this.balance.length - strSizeOfSELA);
        const elaAmount = Number(leftPart) + Number(rightPart) / Config.SELA;

        return elaAmount;
    }

    /**
     * Fees needed to pay for the vote transaction. They have to be deduced from the total amount otherwise
     * funds won't be enough to vote.
     */
    votingFees(): number {
        return 0.001; // ELA
    }

    async createVoteProducerTransaction() {
        const stakeAmount = this.elaToSELAString(this.getBalanceInELA() - this.votingFees());
        console.log('Creating vote transaction with amount', stakeAmount);

        const rawTx =
            await this.walletManager.spvBridge.createVoteProducerTransaction(
                this.masterWalletId, this.chainId,
                '', // To address, not necessary
                stakeAmount,
                JSON.stringify(this.coinTransferService.publickeys),
                '', // Memo, not necessary
            );

        const transfer = new Transfer();
        Object.assign(transfer, {
            masterWalletId: this.masterWalletId,
            chainId: this.chainId,
            rawTransaction: rawTx,
            payPassword: '',
            action: this.intentTransfer.action,
            intentId: this.intentTransfer.intentId,
        });

        let sourceSubwallet = this.walletManager.getMasterWallet(this.masterWalletId).getSubWallet(this.chainId);
        await sourceSubwallet.signAndSendRawTransaction(rawTx, transfer);
    }
}

