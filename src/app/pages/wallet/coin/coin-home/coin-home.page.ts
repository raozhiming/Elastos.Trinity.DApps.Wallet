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
import { ActivatedRoute } from '@angular/router';
import { Events } from '@ionic/angular';
import { Config } from '../../../../config/Config';
import { Native } from '../../../../services/native.service';
import { PopupProvider } from '../../../../services/popup.service';
import { Util } from '../../../../model/Util';
import { WalletManager } from '../../../../services/wallet.service';
import { TranslateService } from '@ngx-translate/core';
import { MasterWallet } from 'src/app/model/MasterWallet';
import { AppService } from 'src/app/services/app.service';
import { CoinTransferService, TransferType } from 'src/app/services/cointransfer.service';
import { StandardCoinName, Coin, CoinType } from 'src/app/model/Coin';
import { SubWallet } from 'src/app/model/SubWallet';
import { TransactionDirection, TransactionStatus } from 'src/app/model/Transaction';
import { ThemeService } from 'src/app/services/theme.service';
import * as moment from 'moment';
import { CurrencyService } from 'src/app/services/currency.service';
import { ERC20SubWallet } from 'src/app/model/ERC20SubWallet';

enum TransactionType {
    RECEIVED = 1,
    SENT = 2,
    RECHARGED = 3
}

type Transaction = {
    'type': TransactionType,
    'name': string,
    'status': string,
    'resultAmount': number,
    'datetime': any,
    'timestamp': number,
    'txId': string,
    'payStatusIcon': string,
    'symbol': string
};

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
    public transferList: Transaction[] = [];

    private votedCount: number = 0;
    private isShowMore: boolean = false;
    private isNodata: boolean = false;

    // Total transactions today
    public todaysTransactions: number = 0;
    private MaxCount: number = 0;
    private pageNo: number = 0;
    private start: number = 0;

    private autoFefreshInterval: any;

    // Helpers
    public Util = Util;
    public SELA = Config.SELA;

    constructor(
        public route: ActivatedRoute,
        public walletManager: WalletManager,
        public translate: TranslateService,
        private coinTransferService: CoinTransferService,
        public native: Native,
        public events: Events,
        public popupProvider: PopupProvider,
        private appService: AppService,
        public theme: ThemeService,
        public currencyService: CurrencyService
    ) {
        this.init();
    }

    ionViewWillEnter() {
        this.events.subscribe(this.chainId + ':syncprogress', (coin) => {
            this.initData();
        });

        this.appService.setBackKeyVisibility(true);
    }

    ionViewDidLeave() {
        this.events.unsubscribe(this.chainId + ':syncprogress');
        this.events.unsubscribe(this.chainId + ':synccompleted');
    }

    async init() {
        this.coinTransferService.reset();

        this.masterWallet = this.walletManager.getActiveMasterWallet();

        this.coinTransferService.reset();
        this.coinTransferService.walletInfo = this.native.clone(this.masterWallet.account);

        this.route.paramMap.subscribe((params) => {
            this.chainId = params.get('name') as StandardCoinName;
            this.appService.setTitleBarTitle(this.chainId);

            this.initData();

            if (this.walletManager.activeMasterWallet.subWallets[this.chainId].progress !== 100) {
                this.events.subscribe(this.chainId + ':synccompleted', (coin) => {
                    this.CheckPublishTx();
                    this.checkUTXOCount();
                });
            } else {
                this.CheckPublishTx();
                this.checkUTXOCount();
            }
        });
    }

    ngOnInit() {
    }

    initData() {
        this.subWallet = this.masterWallet.getSubWallet(this.chainId);

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

    async getAllTx() {
        let allTransactions = await this.subWallet.getTransactions(this.start);
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
            if (transactions.hasOwnProperty(key)) {
                const transaction = transactions[key];
                const timestamp = transaction.Timestamp * 1000;
                const datetime = timestamp === 0 ? 'Pending' : moment(new Date(timestamp)).startOf('minutes').fromNow();
                const txId = transaction.TxHash;
                let txType: TransactionType;
                let payStatusIcon: string = null;
                let name = '';
                let symbol = '';
                const type = transaction.Type;

                // Check if transaction was made today
                this.isNewTransaction(timestamp);

                if (transaction.Direction === TransactionDirection.RECEIVED) {
                    txType = 1;
                    payStatusIcon = './assets/buttons/receive.png';
                    name = this.translate.instant('coin-op-received-ela');
                    symbol = '+';

                    switch (type) {
                        case 6: // RechargeToSideChain
                            name = this.translate.instant("coin-dir-from-mainchain");
                            break;
                        case 7: // WithdrawFromSideChain
                            name = this.translate.instant("coin-dir-from-idchain");
                            break;
                        default:
                        break;
                    }
                } else if (transaction.Direction === TransactionDirection.SENT) {
                    txType = 2;
                    payStatusIcon = './assets/buttons/send.png';
                    symbol = '-';
                    name = this.translate.instant("coin-op-sent-ela");

                    if (type === 8) { // TransferCrossChainAsset
                        if (this.chainId === 'ELA') {
                            name = this.translate.instant("coin-dir-to-idchain");
                        } else { // IDChain
                            name = this.translate.instant("coin-dir-to-mainchain");
                        }
                    }
                } else if (transaction.Direction === TransactionDirection.MOVED) {
                    txType = 3;
                    payStatusIcon = './assets/buttons/transfer.png';
                    symbol = '';
                    name = this.translate.instant("coin-op-transfered-ela");

                    if (this.chainId === StandardCoinName.ELA) { // for now IDChian no vote
                        // vote transaction
                        const isVote = await this.isVoteTransaction(txId);
                        if (isVote) {
                            name = this.translate.instant("coin-op-vote");
                        }
                    } else if (this.chainId === StandardCoinName.IDChain) {
                        if (transaction.Type === 10) { // DID transaction
                            name = this.translate.instant("coin-op-identity");
                        }
                    }
                }

                let status = '';
                switch (transaction.Status) {
                    case TransactionStatus.CONFIRMED:
                        status = this.translate.instant("coin-transaction-status-confirmed");
                        break;
                    case TransactionStatus.PENDING:
                        status = this.translate.instant("coin-transaction-status-pending");
                        break;
                    case TransactionStatus.UNCONFIRMED:
                        status = this.translate.instant("coin-transaction-status-unconfirmed");
                        break;
                }

                const transfer = {
                    'type': txType,
                    'name': name,
                    'status': status,
                    'resultAmount': transaction.Amount / Config.SELA,
                    'datetime': datetime,
                    'timestamp': timestamp,
                    'txId': txId,
                    'payStatusIcon': payStatusIcon,
                    'symbol': symbol
                };
                this.transferList.push(transfer);
            }
        }
    }

    isVoteTransaction(txId: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let transactions = await this.walletManager.spvBridge.getAllTransactions(this.masterWallet.id, this.chainId, 0, txId);
            const transaction = transactions['Transactions'][0];
            if (!Util.isNull(transaction.OutputPayload) && (transaction.OutputPayload.length > 0)) {
                resolve(true);
            }
            else {
                resolve(false);
            }
        });
    }

    onItem(item) {
        this.native.go('/coin-tx-info', { chainId: this.chainId, txId: item.txId });
    }

    receiveFunds() {
        this.coinTransferService.chainId = this.chainId;
        this.native.go('/coin-receive');
    }

    sendFunds() {
        this.coinTransferService.transferType = TransferType.SEND;
        this.coinTransferService.chainId = this.chainId;
        this.native.go('/coin-transfer');
    }

    rechargeFunds() {
        this.coinTransferService.transferType = TransferType.RECHARGE;
        this.coinTransferService.chainId = this.chainId;
        this.native.go('/coin-select');
    }

    // Not sure what 'withdraw' is for
    withdrawFunds() {
        this.coinTransferService.chainId = this.chainId;
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
        if (this.subWallet.type === CoinType.STANDARD) {
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
        let txJson = await this.walletManager.spvBridge.createConsolidateTransaction(this.masterWallet.id, this.chainId, '');
        console.log('coin.page createConsolidateTransaction');
        let transfer = {
            chainId: this.chainId,
            toAddress: '',
            amount: '',
            memo: '',
            fee: 0,
            payPassword: '',
            rawTransaction: txJson,
        };
        this.walletManager.openPayModal(transfer);
    }

    isNewTransaction(timestamp: number) {
        let today = moment(new Date());
        if (today.startOf('day').isSame(moment(timestamp).startOf('day'))) {
            this.todaysTransactions++;
        }
    }

    getSubwalletClass() {
        switch (this.walletManager.activeMasterWallet.subWallets[this.chainId].id) {
            case 'ELA':
                return 'black-card card-row';
            case 'IDChain':
                return 'blue-card card-row';
            case 'ETHSC':
                return 'gray-card card-row';
        }

        if (this.walletManager.activeMasterWallet.subWallets[this.chainId] instanceof ERC20SubWallet) {
            return 'gray2-card card-row';
        }
        
        // Default: nothing? TODO
        return '';
    }

    getSubwalletTitle() {
        return this.walletManager.activeMasterWallet.subWallets[this.chainId].getFriendlyName();
    }
}
