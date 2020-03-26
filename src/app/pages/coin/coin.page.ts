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
import { Config } from '../../services/Config';
import { Native } from '../../services/Native';
import { PopupProvider } from '../../services/popup';
import { Util } from '../../services/Util';
import { WalletManager } from '../../services/WalletManager';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-coin',
    templateUrl: './coin.page.html',
    styleUrls: ['./coin.page.scss'],
})
export class CoinPage implements OnInit {
    public masterWalletInfo = '';
    masterWalletId = '1';
    transferList = [];

    chainId = '';
    pageNo = 0;
    start = 0;

    textShow = '';

    isShowMore = false;
    MaxCount = 0;
    isNodata = false;
    public autoFefreshInterval: any;
    public votedCount = 0;

    Config = Config;
    SELA = Config.SELA;

    constructor(public route: ActivatedRoute, public walletManager: WalletManager, public translate: TranslateService,
                public native: Native, public events: Events, public popupProvider: PopupProvider) {
        this.init();
    }

    ionViewWillEnter() {
        this.events.subscribe(this.chainId + ':syncprogress', (coin) => {
            this.initData();
        });
    }

    ionViewDidLeave() {
        this.events.unsubscribe(this.chainId + ':syncprogress');
        this.events.unsubscribe(this.chainId + ':synccompleted');
    }

    init() {
        Config.coinObj = {};

        this.masterWalletId = Config.getCurMasterWalletId();
        this.walletManager.getMasterWalletBasicInfo(this.masterWalletId, (ret) => {
            Config.coinObj.walletInfo = ret;
        });

        this.route.paramMap.subscribe((params) => {
            this.chainId = params.get('name');
            if (this.chainId === 'ELA') {
                this.textShow = 'text-recharge';
            } else {
                this.textShow = 'text-withdraw';
            }

            this.initData();

            if (Config.curMaster.subWallet[this.chainId].progress !== 100) {
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
        this.pageNo = 0;
        this.start = 0;
        this.MaxCount = 0;
        this.transferList = [];
        this.getAllTx();
    }

    getAllTx() {
        this.walletManager.getAllTransaction(this.masterWalletId, this.chainId, this.start, '', async (ret) => {
            const allTransaction = ret;
            const transactions = allTransaction.Transactions;
            this.MaxCount = allTransaction.MaxCount;
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
                    const datetime = Util.dateFormat(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
                    const txId = transaction.TxHash;
                    let payStatusIcon = transaction.Direction;
                    let name = transaction.Direction;
                    let symbol = '';
                    const type = transaction.Type;
                    if (payStatusIcon === 'Received') {
                        payStatusIcon = './assets/images/exchange-add.png';
                        symbol = '+';

                        switch (type) {
                            case 6: // RechargeToSideChain
                                payStatusIcon = './assets/images/ela-coin.png';
                                name = 'FromELA';
                                break;
                            case 7: // WithdrawFromSideChain
                                payStatusIcon = './assets/images/id-coin.png';
                                name = 'FromDID';
                                break;
                            default:
                            break;
                        }
                    } else if (payStatusIcon === 'Sent') {
                        payStatusIcon = './assets/images/exchange-sub.png';
                        symbol = '-';

                        if (type === 8) { // TransferCrossChainAsset
                            if (this.chainId === 'ELA') {
                                payStatusIcon = './assets/images/id-coin.png';
                                name = 'ToDID';
                            } else { // IDChain
                                payStatusIcon = './assets/images/ela-coin.png';
                                name = 'ToELA';
                            }
                        }
                    } else if (payStatusIcon === 'Moved') {
                        payStatusIcon = './assets/images/exchange-sub.png';
                        symbol = '';

                        if (this.chainId === 'ELA') { // for now IDChian no vote
                            // vote transaction
                            const isVote = await this.isVoteTransaction(txId);
                            if (isVote) {
                                payStatusIcon = './assets/images/vote.png';
                                name = 'Vote';
                            }
                        } else if (this.chainId === Config.IDCHAIN) {
                            if (transaction.Type === 10) { // DID transaction
                                payStatusIcon = './assets/images/did.png';
                                name = 'DID';
                            }
                        }
                    } else if (payStatusIcon === 'Deposit') {
                        payStatusIcon = './assets/images/exchange-sub.png';
                        if (transaction.Amount > 0) {
                            symbol = '-';
                        } else {
                            symbol = '';
                        }
                    }
                    let status = '';
                    switch (transaction.Status) {
                        case 'Confirmed':
                            status = 'Confirmed';
                            break;
                        case 'Pending':
                            status = 'Pending';
                            break;
                        case 'Unconfirmed':
                            status = 'Unconfirmed';
                            break;
                    }

                    const transfer = {
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
        });
    }

    isVoteTransaction(txId: string): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.walletManager.getAllTransaction(this.masterWalletId, this.chainId, 0, txId, (ret) => {
                const transaction = ret['Transactions'][0];
                if (!Util.isNull(transaction.OutputPayload) && (transaction.OutputPayload.length > 0)) {
                    resolve(true);
                }
                resolve(false);
            });
        });
    }

    onItem(item) {
        this.native.go('/recordinfo', { chainId: this.chainId, txId: item.txId });
    }

    onNext(type) {
        Config.coinObj.transfer = {
            toAddress: '',
            amount: '',
            memo: '',
            fee: 0,
            payPassword: '',
            chainId: this.chainId,
        };
        switch (type) {
            case 1:
                this.native.go('/receive');
                break;
            case 2:
                Config.coinObj.transfer.type = 'transfer';
                this.native.go('/transfer');
                break;
            case 3:
                if (this.chainId === 'ELA') {
                    Config.coinObj.transfer.type = 'recharge';
                    const coinList = Config.getSubWalletList();
                    if (coinList.length === 1) {
                        Config.coinObj.transfer.sideChainId = coinList[0].name;
                        this.native.go('/transfer');
                    } else {
                        this.native.go('/coin-select');
                    }
                } else {
                    Config.coinObj.transfer.type = 'withdraw';
                    this.native.go('/transfer');
                }
                break;
            default:
                console.log('type error:', type);
                break;
        }
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
        setTimeout(() => {
            event.target.complete();
        }, 1000);
    }

    CheckPublishTx() {
        for (const txId in Config.masterManager.transactionMap) {
            if (this.getIndexByTxId(txId)) {
                delete Config.masterManager.transactionMap[txId];
            }
        }

        console.log('Fail txId:', Config.masterManager.transactionMap);
        for (const txId in Config.masterManager.transactionMap) {
            this.popupProvider.ionicAlert_PublishedTx_fail('confirmTitle', txId, txId);
        }

        Config.masterManager.cleanTransactionMap();
    }

    getIndexByTxId(txId: string) {
        return this.transferList.findIndex(e => e.txId === txId);
    }

    checkUTXOCount() {
        if (Config.needCheckUTXOCount) {
            this.walletManager.getAllUTXOs(this.masterWalletId, this.chainId, 0, 1, '', (UTXOsJson) => {
                console.log('UTXOsJson:', UTXOsJson);
                const UTXOsCount = this.translate.instant('text-consolidate-UTXO-counts', {count: UTXOsJson.MaxCount});
                if (UTXOsJson.MaxCount >= Config.UTXOThreshold) {
                    this.popupProvider.ionicConfirmWithSubTitle('text-consolidate-prompt',
                                                                UTXOsCount,
                                                                'text-consolidate-note').then((ret: boolean) => {
                        if (ret) {
                            this.createConsolidateTransaction();
                        }
                    });
                }
            });

            Config.needCheckUTXOCount = false;
        }
    }

    createConsolidateTransaction() {
        this.walletManager.createConsolidateTransaction(this.masterWalletId, this.chainId, '', (txJson: string) => {
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
            Config.masterManager.openPayModal(transfer);
        });
    }
}
