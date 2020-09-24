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

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Events } from '@ionic/angular';
import { Config } from '../../../../config/Config';
import { Native } from '../../../../services/native.service';
import { PopupProvider } from '../../../../services/popup.service';
import { Util } from '../../../../model/Util';
import { WalletManager } from '../../../../services/wallet.service';
import { TranslateService } from '@ngx-translate/core';
import { MasterWallet } from 'src/app/model/MasterWallet';
import { AppService } from 'src/app/services/app.service';
import { CoinTransferService, TransferType, Transfer } from 'src/app/services/cointransfer.service';
import { StandardCoinName, CoinType } from 'src/app/model/Coin';
import { SubWallet } from 'src/app/model/SubWallet';
import { TransactionDirection, TransactionStatus, TransactionInfo, TransactionType } from 'src/app/model/Transaction';
import { ThemeService } from 'src/app/services/theme.service';
import * as moment from 'moment';
import { CurrencyService } from 'src/app/services/currency.service';
import { ERC20SubWallet } from 'src/app/model/ERC20SubWallet';
import { StandardSubWallet } from 'src/app/model/StandardSubWallet';
import { UiService } from 'src/app/services/ui.service';
import BigNumber from 'bignumber.js';

@Component({
    selector: 'app-coin-home',
    templateUrl: './coin-home.page.html',
    styleUrls: ['./coin-home.page.scss'],
})
export class CoinHomePage implements OnInit {

    public masterWalletInfo = '';
    public masterWallet: MasterWallet = null;
    public subWallet: SubWallet = null;
    public chainId: StandardCoinName = null;
    public transferList: TransactionInfo[] = [];

    private votedCount = 0;
    private isShowMore = false;
    private isNodata = false;

    // Total transactions today
    public todaysTransactions: number = 0;
    private MaxCount: number = 0;
    private pageNo: number = 0;
    private start: number = 0;
    private ethscAddress: string;

    private autoFefreshInterval: any;

    // Helpers
    public Util = Util;
    public SELA = Config.SELA;

    private eventId = '';

    constructor(
        public router: Router,
        public walletManager: WalletManager,
        public translate: TranslateService,
        private coinTransferService: CoinTransferService,
        public native: Native,
        public events: Events,
        public popupProvider: PopupProvider,
        private appService: AppService,
        public theme: ThemeService,
        public currencyService: CurrencyService,
        public uiService: UiService
    ) {
        this.init();
    }

    ionViewWillEnter() {
        this.events.subscribe(this.masterWallet.id + ':' + this.chainId + ':syncprogress', (coin) => {
            this.initData();
        });

        this.appService.setBackKeyVisibility(true);
    }

    ionViewDidLeave() {
        this.events.unsubscribe(this.masterWallet.id + ':' + this.chainId + ':syncprogress');
        if (this.eventId) this.events.unsubscribe(this.eventId);
    }

    async init() {
        const navigation = this.router.getCurrentNavigation();
        if (!Util.isEmptyObject(navigation.extras.state)) {
            let masterWalletId = navigation.extras.state.masterWalletId;
            this.chainId = navigation.extras.state.chainId as StandardCoinName;

            this.masterWallet = this.walletManager.getMasterWallet(masterWalletId);

            this.coinTransferService.reset();
            this.coinTransferService.masterWalletId = masterWalletId;
            this.coinTransferService.chainId = this.chainId;
            this.coinTransferService.walletInfo = this.native.clone(this.masterWallet.account);

            this.appService.setTitleBarTitle(this.chainId);

            this.initData();

            if (this.masterWallet.subWallets[this.chainId].progress !== 100) {
                this.eventId = this.masterWallet.id + ':' + this.chainId + ':synccompleted';
                this.events.subscribe(this.eventId, (coin) => {
                    this.events.unsubscribe(this.eventId);
                    this.eventId = null;
                    this.CheckPublishTx();
                    this.checkUTXOCount();
                });
            } else {
                this.CheckPublishTx();
                this.checkUTXOCount();
            }
        }
    }

    ngOnInit() {
    }

    async initData() {
        this.subWallet = this.masterWallet.getSubWallet(this.chainId);
        if (this.chainIsETHSC()) {
            this.ethscAddress = await this.subWallet.createAddress();
        }

        this.pageNo = 0;
        this.start = 0;
        this.MaxCount = 0;
        this.transferList = [];
        this.todaysTransactions = 0;
        this.getAllTx();
    }

    chainIsELA(): boolean {
        return this.chainId === StandardCoinName.ELA;
    }

    chainIsDID(): boolean {
        return this.chainId === StandardCoinName.IDChain;
    }

    chainIsETHSC(): boolean {
        return this.chainId === StandardCoinName.ETHSC;
    }

    async getAllTx() {
        let allTransactions = await this.subWallet.getTransactions(this.start);
        console.log("Got all transactions: ", JSON.parse(JSON.stringify(allTransactions)));

        const transactions = allTransactions.Transactions;
        this.MaxCount = allTransactions.MaxCount;
        if (this.MaxCount > 0) {
            this.isNodata = false;
        } else {
            this.isNodata = true;
        }

        if (this.start >= this.MaxCount) {
            this.isShowMore = false;
            return;
        } else {
            this.isShowMore = true;
        }
        if (!transactions) {
            this.isShowMore = false;
            return;
        }

        if (this.MaxCount <= 20) {
            this.isShowMore = false;
        }

        for (const key in transactions) {
            // console.log("key", key, "transaction", transactions[key]);
            if (transactions.hasOwnProperty(key)) {
                const transaction = transactions[key];
                let amount: BigNumber;
                if (this.chainIsETHSC()) {
                    if (transaction.IsErrored || (transaction.BlockNumber === 0)) {
                        // remove the wrong transaction
                        await this.deleteTransaction(transaction);
                        continue;
                    }
                    // TODO: upgrade spvsdk, now the result from spvsdk like: 0.010000000000000
                    amount = new BigNumber(transaction.Amount);
                    transaction.Fee = parseFloat(transaction.Fee.toString());
                    transaction.Direction = this.getETHSCTransactionDirection(transaction.TargetAddress);
                } else {
                    amount = new BigNumber(transaction.Amount, 10).dividedBy(Config.SELAAsBigNumber);
                }

                const timestamp = transaction.Timestamp * 1000;
                const datetime = timestamp === 0 ? this.translate.instant('coin-transaction-status-pending')
                        : moment(new Date(timestamp)).startOf('minutes').fromNow();
                const txId = transaction.TxHash || transaction.Hash; // ETHSC use TD or Hash
                let txType: TransactionType;
                let payStatusIcon: string = null;
                let name = '';
                let symbol = '';
                const type = transaction.Type;

                // Check if transaction was made today
                this.isNewTransaction(timestamp);

                if (transaction.Direction === TransactionDirection.RECEIVED) {
                    txType = TransactionType.RECEIVED;
                    payStatusIcon = './assets/buttons/receive.png';
                    symbol = '+';
                    name = this.getTransactionName(transaction.Direction, type, transaction.TopUpSidechain);
                } else if (transaction.Direction === TransactionDirection.SENT) {
                    txType = TransactionType.SENT;
                    payStatusIcon = './assets/buttons/send.png';
                    symbol = '-';
                    name = this.getTransactionName(transaction.Direction, type, transaction.TopUpSidechain);
                } else if (transaction.Direction === TransactionDirection.MOVED) {
                    txType = TransactionType.TRANSFER;
                    payStatusIcon = './assets/buttons/transfer.png';
                    symbol = '';
                    name = this.translate.instant("coin-op-transfered-ela");

                    if (this.chainIsELA()) { // IDChian no vote
                        const isVote = await this.isVoteTransaction(txId);
                        if (isVote) {
                            name = this.translate.instant("coin-op-vote");
                        }
                    } else if (this.chainIsDID()) {
                        if (transaction.Type === 10) { // DID transaction
                            name = this.translate.instant("coin-op-identity");
                        }
                    }
                }

                let confirmStatus: number; // Number of confirmations
                if (this.chainIsETHSC()) // ETHSC use Confirmations - TODO: FIX THIS - SHOULD BE EITHER CONFIRMSTATUS or CONFIRMATIONS BUT NOT BOTH
                    confirmStatus = transaction.Confirmations;
                else
                    confirmStatus = transaction.ConfirmStatus;

                const status = this.getTransactionStatusName(transaction.Status);
                const transfer: TransactionInfo = {
                    amount: amount.toString(),
                    confirmStatus: confirmStatus,
                    datetime,
                    direction: transaction.Direction,
                    fee: transaction.Fee,
                    memo: transaction.Memo,
                    name,
                    payStatusIcon,
                    status,
                    symbol,
                    timestamp,
                    txId,
                    type: txType,
                };
                this.transferList.push(transfer);
            }
        }
    }

    isVoteTransaction(txId: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const transactions = await this.walletManager.spvBridge.getAllTransactions(this.masterWallet.id, this.chainId, 0, txId);
            const transaction = transactions.Transactions[0];
            if (!Util.isNull(transaction.OutputPayload) && (transaction.OutputPayload.length > 0)) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

    getETHSCTransactionDirection(targetAddress): TransactionDirection {
        if (this.ethscAddress === targetAddress) {
            return TransactionDirection.RECEIVED;
        } else {
            return TransactionDirection.SENT;
        }
    }

    getTransactionName(direction: TransactionDirection, type: number, topUpSidechain: string): string {
        let transactionName = '';
        switch (direction) {
            case TransactionDirection.RECEIVED:
                // TODO: upgrade spvsdk, check the ETHSC
                transactionName = this.translate.instant('coin-op-received-ela');
                switch (type) {
                    case 6: // RechargeToSideChain
                        transactionName = this.translate.instant("coin-dir-from-mainchain");
                        break;
                    case 7: // WithdrawFromSideChain
                        switch (topUpSidechain) {
                            case StandardCoinName.IDChain:
                                transactionName = this.translate.instant("coin-dir-from-idchain");
                                break;
                            case StandardCoinName.ETHSC:
                                transactionName = this.translate.instant("coin-dir-from-ethsc");
                                break;
                            default:
                                break;
                        }
                        break;
                    default:
                    break;
                }
                break;
            case TransactionDirection.SENT:
                transactionName = this.translate.instant("coin-op-sent-ela");

                if (type === 8) { // TransferCrossChainAsset
                    switch (topUpSidechain) {
                        case StandardCoinName.IDChain:
                            transactionName = this.translate.instant("coin-dir-to-idchain");
                            break;
                        case StandardCoinName.ETHSC:
                            transactionName = this.translate.instant("coin-dir-to-ethsc");
                            break;
                        default:
                            transactionName = this.translate.instant("coin-dir-to-mainchain");
                            break;
                    }
                }
                break;
        }
        return transactionName;
    }

    getTransactionStatusName(status: TransactionStatus): string {
        let statusName = '';
        switch (status) {
            case TransactionStatus.CONFIRMED:
                statusName = this.translate.instant("coin-transaction-status-confirmed");
                break;
            case TransactionStatus.PENDING:
                statusName = this.translate.instant("coin-transaction-status-pending");
                break;
            case TransactionStatus.UNCONFIRMED:
                statusName = this.translate.instant("coin-transaction-status-unconfirmed");
                break;
        }
        return statusName;
    }

    async deleteTransaction(tx) {
        if (this.chainIsETHSC()) {
            await this.masterWallet.walletManager.spvBridge.deleteTransfer(
                this.masterWallet.id,
                tx
            );
        }
    }

    onItem(item) {
        this.native.go('/coin-tx-info', { masterWalletId: this.masterWallet.id,
                                        chainId: this.chainId, transactionInfo: item });
    }

    receiveFunds() {
        this.native.go('/coin-receive');
    }

    sendFunds() {
        this.coinTransferService.transferType = TransferType.SEND;
        this.native.go('/coin-transfer');
    }

    transferFunds() {
        if (this.chainIsELA()) {
            this.rechargeFunds();
        } else {
            this.withdrawFunds();
        }
    }

    // mainchain to sidechain
    rechargeFunds() {
        this.coinTransferService.transferType = TransferType.RECHARGE;
        this.native.go('/coin-select');
    }

    // sidechain to mainchain
    withdrawFunds() {
        this.coinTransferService.transferType = TransferType.WITHDRAW;
        this.native.go('/coin-transfer');
    }

    clickMore() {
        this.pageNo++;
        this.start = this.pageNo * 20;
        if (this.start >= this.MaxCount) {
            this.isShowMore = false;
            return;
        }
        this.isShowMore = true;
        this.getAllTx();
    }

    doRefresh(event) {
        this.initData();
        this.currencyService.fetch();
        setTimeout(() => {
            event.target.complete();
        }, 1000);
    }

    CheckPublishTx() {
        for (const txId in this.walletManager.transactionMap) {
            if (this.getIndexByTxId(txId)) {
                delete this.walletManager.transactionMap[txId];
            }
        }

        console.log('Fail txId:', this.walletManager.transactionMap);
        for (const txId in this.walletManager.transactionMap) {
            this.popupProvider.ionicAlert_PublishedTx_fail('confirmTitle', txId, txId);
        }

        this.walletManager.cleanTransactionMap();
    }

    getIndexByTxId(txId: string) {
        return this.transferList.findIndex(e => e.txId === txId);
    }

    async checkUTXOCount() {
        // Check UTXOs only for SPV based coins.
        if ((this.subWallet.type === CoinType.STANDARD) && !this.chainIsETHSC()) {
            if (this.walletManager.needToCheckUTXOCountForConsolidation) {
                let UTXOsJson = await this.walletManager.spvBridge.getAllUTXOs(this.masterWallet.id, this.chainId, 0, 1, '');
                console.log('UTXOsJson:', UTXOsJson);
                const UTXOsCount = this.translate.instant('text-consolidate-UTXO-counts', {count: UTXOsJson.MaxCount});
                if (UTXOsJson.MaxCount >= Config.UTXO_CONSOLIDATE_PROMPT_THRESHOLD) {
                    let ret = await this.popupProvider.ionicConfirmWithSubTitle('text-consolidate-prompt', UTXOsCount, 'text-consolidate-note')
                    if (ret) {
                        await this.createConsolidateTransaction();
                    }
                }

                this.walletManager.needToCheckUTXOCountForConsolidation = false;
            }
        }
    }

    async createConsolidateTransaction() {
        let rawTx = await this.walletManager.spvBridge.createConsolidateTransaction(this.masterWallet.id, this.chainId, '');
        console.log('coin-home.page createConsolidateTransaction');
        const transfer = new Transfer();
        Object.assign(transfer, {
            masterWalletId: this.masterWallet.id,
            chainId: this.chainId,
            rawTransaction: rawTx,
            payPassword: '',
            action: null,
            intentId: null,
        });

        await this.subWallet.signAndSendRawTransaction(rawTx, transfer);
    }

    isNewTransaction(timestamp: number) {
        let today = moment(new Date());
        if (today.startOf('day').isSame(moment(timestamp).startOf('day'))) {
            this.todaysTransactions++;
        }
    }

    /** Returns the currency to be displayed for this coin. */
    getCoinBalanceCurrency() {
        return this.subWallet.getDisplayTokenName();
    }

    getSubwalletClass() {
        switch (this.subWallet.id) {
            case 'ELA':
                return 'black-card card-row';
            case 'IDChain':
                return 'blue-card card-row';
            case 'ETHSC':
                return 'gray-card card-row';
        }
        if (this.subWallet instanceof ERC20SubWallet) {
            return 'gray2-card card-row';
        }

        return 'black-card card-row';
    }

    getSubwalletTitle() {
        return this.subWallet.getFriendlyName();
    }

    coinCanBeTransferred() {
        // Standard ELA coins can be transferred; ERC20 coins can't
        if (this.subWallet instanceof StandardSubWallet)
            return true;
        else
            return false;
    }

    /**
     * Whether the active subwallet can display currency amounts or not. For example for now,
     * we are not able to display USD value for ERC20 tokens.
     */
    canDisplayCurrency(): boolean {
        return !(this.subWallet instanceof ERC20SubWallet);
    }
}
