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
import { CoinTransferService, Transfer } from 'src/app/services/cointransfer.service';
import { MasterWallet } from 'src/app/model/MasterWallet';
import { IntentService } from 'src/app/services/intent.service';
import { WalletAccountType } from 'src/app/model/WalletAccount';

declare let appManager: AppManagerPlugin.AppManager;

@Component({
  selector: 'app-crproposalvoteagainst',
  templateUrl: './crproposalvoteagainst.page.html',
  styleUrls: ['./crproposalvoteagainst.page.scss'],
})
export class CRProposalVoteAgainstPage implements OnInit {
    masterWallet: MasterWallet = null;
    chainId: string; // ELA
    transfer: Transfer = null;

    balance: string; // Balance in SELA
    voteBalanceELA = 0; // ELA

    constructor(public walletManager: WalletManager, public appService: AppService,
                private coinTransferService: CoinTransferService,
                private intentService: IntentService,
                public native: Native, public zone: NgZone, public popupProvider: PopupProvider) {
        this.init();
    }

    ngOnInit() {
    }

    ionViewDidEnter() {
        if (this.coinTransferService.walletInfo.Type === WalletAccountType.MULTI_SIGN) {
            // TODO: reject voting if multi sign (show error popup), as multi sign wallets cannot vote.
            this.appService.close();
        }

        appManager.setVisible("show");
    }

    init() {
        this.transfer = this.coinTransferService.transfer;
        this.chainId = this.coinTransferService.transfer.chainId;
        this.masterWallet = this.walletManager.getActiveMasterWallet();

        this.hasPendingVoteTransaction();
    }

    async hasPendingVoteTransaction() {
        let info = await this.walletManager.spvBridge.getBalanceInfo(this.masterWallet.id, this.chainId);
        
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
    async cancelOperation() {
        await this.intentService.sendIntentResponse(this.transfer.action, {txid: null}, this.transfer.intentId);
        this.appService.close();
    }

    goTransaction() {
        if (this.checkValue()) {
            this.createVoteCRProposalTransaction();
        }
    }

    checkValue() {
        // TODO: Check balance
        return true;
    }

    async createVoteCRProposalTransaction() {
        console.log('Creating vote transaction');

        let invalidCandidates = await this.walletManager.computeVoteInvalidCandidates(this.masterWallet.id);

        this.transfer.rawTransaction =  await this.walletManager.spvBridge.createVoteCRCProposalTransaction(
            this.masterWallet.id, 
            this.chainId,
            '', 
            this.transfer.votes, 
            this.transfer.memo, 
            JSON.stringify(invalidCandidates));
        
        this.walletManager.openPayModal(this.transfer);
    }
}

