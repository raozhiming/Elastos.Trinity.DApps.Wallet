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
import { CoinTransferService, Transfer, IntentTransfer } from 'src/app/services/cointransfer.service';
import { MasterWallet } from 'src/app/model/MasterWallet';
import { IntentService } from 'src/app/services/intent.service';
import { WalletAccountType } from 'src/app/model/WalletAccount';
import { StandardCoinName } from 'src/app/model/Coin';
import { VoteType, CRProposalVoteInfo } from 'src/app/model/SPVWalletPluginBridge';

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
    intentTransfer: IntentTransfer;

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

    async ionViewDidEnter() {
        if (this.coinTransferService.walletInfo.Type === WalletAccountType.MULTI_SIGN) {
            // TODO: reject voting if multi sign (show error popup), as multi sign wallets cannot vote.
            this.appService.close();
        }

        appManager.setVisible("show");

        // TMP BPI TEST
        let previousVoteInfo = await this.walletManager.spvBridge.getVoteInfo(this.masterWallet.id, StandardCoinName.ELA, VoteType.CRCProposal) as CRProposalVoteInfo[];
        console.log("previousVoteInfo", previousVoteInfo);
    }

    init() {
        this.transfer = this.coinTransferService.transfer;
        this.intentTransfer = this.coinTransferService.intentTransfer;
        this.chainId = this.coinTransferService.chainId;
        this.masterWallet = this.walletManager.getMasterWallet(this.coinTransferService.masterWalletId);

        this.fetchBalance();

        this.hasPendingVoteTransaction();
    }

    async fetchBalance() {
        let balance = await this.walletManager.spvBridge.getBalance(this.masterWallet.id, this.chainId);

        this.zone.run(()=>{
            console.log("Received balance:", balance);
            this.balance = balance;
        });
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
        await this.intentService.sendIntentResponse(
            this.intentTransfer.action,
            { txid: null, status: 'cancelled' },
            this.intentTransfer.intentId
        );

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

    private getActualVoteAmount(): string {
        return this.elaToSELAString(this.getBalanceInELA() - this.votingFees());
    }

    async createVoteCRProposalTransaction() {
        console.log('Creating vote transaction', this.transfer);

        let invalidCandidates = await this.walletManager.computeVoteInvalidCandidates(this.masterWallet.id);

        // The transfer "votes" array must contain exactly ONE entry: the voted proposal
        // TODO: don't use a votes array in a global transfer object. Use a custom object for CR proposal voting.
        let votes = {}
        votes[this.transfer.votes[0]] = this.getActualVoteAmount(); // Vote with everything
        console.log("Vote:", votes);

        this.transfer.rawTransaction =  await this.walletManager.spvBridge.createVoteCRCProposalTransaction(
            this.masterWallet.id,
            this.chainId,
            '',
            JSON.stringify(votes),
            this.transfer.memo,
            JSON.stringify(invalidCandidates));

        this.walletManager.openPayModal(this.transfer);
    }
}

