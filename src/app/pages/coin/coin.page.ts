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
import { Util } from '../../services/Util';
import { WalletManager } from '../../services/WalletManager';

@Component({
    selector: 'app-coin',
    templateUrl: './coin.page.html',
    styleUrls: ['./coin.page.scss'],
})
export class CoinPage implements OnInit {
    public masterWalletInfo: string = "";
    masterWalletId: string = "1";
    transferList = [];

    coinCount = 0;

    coinId = 0;

    chainId = "";
    pageNo = 0;
    start = 0;

    textShow = '';

    isShowMore = false;
    MaxCount = 0;
    isNodata: boolean = false;
    public autoFefreshInterval: any;
    public votedCount = 0;

    Config = Config;

    constructor(public route: ActivatedRoute, public walletManager: WalletManager,
                public native: Native, public events: Events) {
        this.init();
    }

    ionViewWillEnter() {
        this.startRefreshTimer();
    }

    ionViewDidLeave() {
        this.closeRefreshTimer();
    }

    init() {
        Config.coinObj = {};

        this.masterWalletId = Config.getCurMasterWalletId();
        this.walletManager.getMasterWalletBasicInfo(this.masterWalletId, (ret) => {
            Config.coinObj.walletInfo = ret;
        });

        this.route.paramMap.subscribe((params) => {
            this.chainId = params.get("name");
            Config.coinObj.chainId = this.chainId;
            if (this.chainId === 'ELA') {
                this.textShow = 'text-recharge';
            } else {
                this.textShow = 'text-withdraw';
            }

            this.initData();
        });
    }

    ngOnInit() {
    }

    initData() {
        // if (this.chainId === "ELA") {
        //     this.walletManager.getBalance(this.masterWalletId, this.chainId, Config.voted, (ret) => {
        //         this.votedCount = ret / Config.SELA;
        //     });
        // }

        this.pageNo = 0;
        this.start = 0;
        this.MaxCount = 0;
        this.transferList = [];

        this.getAllTx();
    }

    getAllTx() {
        this.walletManager.getAllTransaction(this.masterWalletId, this.chainId, this.start, '', async (ret) => {
            let allTransaction = ret;
            let transactions = allTransaction['Transactions'];
            this.MaxCount = allTransaction['MaxCount'];
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

            for (let key in transactions) {
                let transaction = transactions[key];
                let timestamp = transaction['Timestamp'] * 1000;
                let datetime = Util.dateFormat(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
                let txId = transaction['TxHash'];
                let payStatusIcon = transaction["Direction"];
                let name = transaction["Direction"];//JSON.parse("{" + transaction["memo"] +"}").msg;;
                let symbol = "";
                if (payStatusIcon === "Received") {
                    payStatusIcon = './assets/images/exchange-add.png';
                    symbol = "+";
                } else if (payStatusIcon === "Sent") {
                    payStatusIcon = './assets/images/exchange-sub.png';
                    symbol = "-";
                } else if (payStatusIcon === "Moved") {
                    payStatusIcon = './assets/images/exchange-sub.png';
                    symbol = "";

                    //for vote transaction
                    let isVote = await this.isVoteTransaction(txId);
                    if (isVote) {
                        name = "Vote";
                    }
                } else if (payStatusIcon === "Deposit") {
                    payStatusIcon = './assets/images/exchange-sub.png';
                    if (transaction["Amount"] > 0) {
                        symbol = "-";
                    } else {
                        symbol = "";
                    }
                }
                let status = '';
                switch (transaction["Status"]) {
                    case 'Confirmed':
                        status = 'Confirmed'
                        break;
                    case 'Pending':
                        status = 'Pending'
                        break;
                    case 'Unconfirmed':
                        status = 'Unconfirmed'
                        break;
                }

                let transfer = {
                    "name": name,
                    "status": status,
                    "resultAmount": transaction["Amount"] / Config.SELA,
                    "datetime": datetime,
                    "timestamp": timestamp,
                    "txId": txId,
                    "payStatusIcon": payStatusIcon,
                    "symbol": symbol
                }
                this.transferList.push(transfer);
            }
        });
    }

    startRefreshTimer() {
        if (this.autoFefreshInterval == null) {
            this.autoFefreshInterval = setInterval(() => {
                this.getAllTx();
            }, 30000); // 30s
        }
    }
    closeRefreshTimer() {
        if (this.autoFefreshInterval) {
            clearInterval(this.autoFefreshInterval);
            this.autoFefreshInterval = null;
        }
    }

    isVoteTransaction(txId: string): Promise<any> {
        return new Promise((resolve, reject)=>{
            this.walletManager.getAllTransaction(this.masterWalletId, this.chainId, 0, txId, (ret) => {
                let transaction = ret['Transactions'][0];
                if (!Util.isNull(transaction['OutputPayload']) && (transaction['OutputPayload'].length > 0)) {
                    resolve(true);
                }
                resolve(false);
            });
        });
    }

    onItem(item) {
        this.native.go("/recordinfo", { chainId: this.chainId, txId: item.txId });
    }

    onNext(type) {
        Config.coinObj.chainId = this.chainId;
        Config.coinObj.transfer = {
            toAddress: '',
            amount: '',
            memo: '',
            fee: 0,
            payPassword: '',
        };
        switch (type) {
            case 1:
                this.native.go("/receive");
                break;
            case 2:
                Config.coinObj.transfer.type = "transfer";
                this.native.go("/transfer");
                break;
            case 3:
                if (this.chainId == 'ELA') {
                    Config.coinObj.transfer.type = "recharge";
                    var coinList = Config.getSubWalletList();
                    if (coinList.length == 1) {
                        Config.coinObj.chainId = coinList[0].name;
                        this.native.go("/transfer");
                    }
                    else {
                        this.native.go("/coin-select");
                    }
                }
                else {
                    Config.coinObj.transfer.type = "withdraw";
                    this.native.go("/transfer");
                }
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
        this.walletManager.getBalance(this.masterWalletId, this.chainId, (ret) => {
            this.coinCount = ret / Config.SELA;
        });
        this.pageNo = 0;
        this.start = 0;
        this.transferList = [];
        this.MaxCount = 0;
        this.getAllTx();
        setTimeout(() => {
            event.target.complete();
        }, 1000);
    }
}
