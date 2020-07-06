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

declare let appManager: AppManagerPlugin.AppManager;

@Component({
  selector: 'app-crmembervote',
  templateUrl: './crmembervote.page.html',
  styleUrls: ['./crmembervote.page.scss'],
})
export class CRmembervotePage implements OnInit {

    masterWalletId = '1';
    chainId: string; // ELA
    transfer: any = null;
    votecount = 0;

    balance: string; // Balance in SELA
    voteBalanceELA = 0; // ELA

    constructor(public walletManager: WalletManager, public appService: AppService,
                public native: Native, public zone: NgZone, public popupProvider: PopupProvider) {
        this.init();
    }

    ngOnInit() {
    }

    ionViewDidEnter() {
        if (this.walletManager.coinObj.walletInfo['Type'] === 'Multi-Sign') {
            // TODO: reject voting if multi sign (show error popup), as multi sign wallets cannot vote.
            this.appService.close();
        }

        appManager.setVisible("show", ()=>{}, (err)=>{});
    }

    init() {
        console.log(this.walletManager.coinObj);
        this.transfer = this.walletManager.coinObj.transfer;
        this.chainId = this.walletManager.coinObj.transfer.chainId;
        this.masterWalletId = this.walletManager.getCurMasterWalletId();

        this.parseVotes();

        this.hasPendingVoteTransaction();
    }

    parseVotes() {
        this.votecount = 0;
        let voteBalanceSela = 0;
        for (const key of Object.keys(this.transfer.votes)) {
            if (this.transfer.votes.hasOwnProperty(key)) {
                voteBalanceSela += parseInt(this.transfer.votes[key], 10);
                this.votecount++;
            }
        }
        this.voteBalanceELA = voteBalanceSela / Config.SELA;
        console.log('totalVotes:', this.voteBalanceELA);
    }

    async hasPendingVoteTransaction() {
        let info = await this.walletManager.spvBridge.getBalanceInfo(this.masterWalletId, this.chainId);
        
        let balanceInfo = JSON.parse(info);
        // console.log('balanceInfo ', balanceInfo);
        if (balanceInfo[0]['Summary']['SpendingBalance'] !== '0') {
            await this.popupProvider.ionicAlert('confirmTitle', 'test-vote-pending');
            this.cancelOperation();
        }
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
        if (this.checkValue()) {
            this.createVoteCRTransaction();
        }
    }

    checkValue() {
        // TODO: Check balance
        return true;
    }

    async createVoteCRTransaction() {
        console.log('Creating vote CR transaction');
        this.transfer.rawTransaction =  await this.walletManager.spvBridge.createVoteCRTransaction(this.masterWalletId, this.chainId,
                '', this.transfer.votes, this.transfer.memo, this.transfer.invalidCandidates);
        // TODO need to check DropVotes
        this.walletManager.openPayModal(this.transfer);
    }
}

