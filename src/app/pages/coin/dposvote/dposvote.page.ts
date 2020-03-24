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
    selector: 'app-dposvote',
    templateUrl: './dposvote.page.html',
    styleUrls: ['./dposvote.page.scss'],
})
export class DPoSVotePage implements OnInit {
    masterWalletId = '1';
    transfer: any = null;

    balance: string; // Balance in SELA
    chainId: string;
    walletInfo = {};

    constructor(public walletManager: WalletManager, public appService: AppService,
                public native: Native, public zone: NgZone, public popupProvider: PopupProvider) {
        this.init();
    }

    ngOnInit() {
    }

    ionViewDidEnter() {
        if (this.walletInfo["Type"] === "Multi-Sign") {
            // TODO: reject voting if multi sign (show error popup), as multi sign wallets cannot vote.
            this.appService.close();
        }

        appManager.setVisible("show", ()=>{}, (err)=>{});
    }

    init() {
        console.log(Config.coinObj);
        this.transfer = Config.coinObj.transfer;
        this.chainId = Config.coinObj.chainId;
        this.walletInfo = Config.coinObj.walletInfo;
        this.masterWalletId = Config.getCurMasterWalletId();
        this.fetchBalance();

        this.hasPendingVoteTransaction();
    }

    fetchBalance() {
        this.walletManager.getBalance(this.masterWalletId, this.chainId, (ret: string) => {
            this.zone.run(()=>{
                console.log("Received balance:", ret);
                this.balance = ret;
            });
        });
    }

    hasPendingVoteTransaction() {
        this.walletManager.getBalanceInfo(this.masterWalletId, this.chainId, async (info) => {
            let balanceInfo = JSON.parse(info);
            // console.log('balanceInfo ', balanceInfo);
            if (balanceInfo[0]['Summary']['SpendingBalance'] !== '0') {
                await this.popupProvider.ionicAlert('confirmTitle', 'test-vote-pending');
                this.cancelOperation();
            }
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

    checkValue() {
        if (this.getBalanceInELA() == 0) {
            this.native.toast_trans('amount-null');
            return;
        }

        this.walletManager.isAddressValid(this.masterWalletId, this.transfer.toAddress,
            () => { this.createVoteProducerTransaction(); },
            () => { this.native.toast_trans("contact-address-digits"); }
        );
    }

    elaToSELAString(elaAmount: number) {
        let integerPart = Math.trunc(elaAmount);
        let fracPart = elaAmount - integerPart;

        let integerPartString = integerPart.toString();
        let fracPartString = Math.trunc(fracPart*Config.SELA).toString();

        return integerPartString+fracPartString;
    }

    // 15950000000 SELA will give 159.5 ELA
    // We need to use this trick because JS is limited to 2^53 bits numbers and this could create
    // problems with big ELA amounts.
    getBalanceInELA(): number {
        if (!this.balance)
            return 0;

        let strSizeOfSELA = 8;
        let leftPart = this.balance.substr(0, this.balance.length-strSizeOfSELA);
        let rightPart = this.balance.substr(this.balance.length-strSizeOfSELA);

        let elaAmount = Number(leftPart) + Number(rightPart)/Config.SELA;
        return elaAmount;
    }

    /**
     * Fees needed to pay for the vote transaction. They have to be deduced from the total amount otherwise
     * funds won't be enough to vote.
     */
    votingFees(): number {
        return 0.001; // ELA
    }

    createVoteProducerTransaction() {
        let stakeAmount = this.elaToSELAString(this.getBalanceInELA() - this.votingFees());
        console.log("Creating vote transaction with amount", stakeAmount);

        this.transfer.toAddress = "";
        this.walletManager.createVoteProducerTransaction(this.masterWalletId, this.chainId,
            this.transfer.toAddress,
            stakeAmount,
            JSON.stringify(this.transfer.publicKeys),
            this.transfer.memo,
            (data) => {
                this.transfer.rawTransaction = data;
                Config.masterManager.openPayModal(this.transfer);
            });
    }
}

