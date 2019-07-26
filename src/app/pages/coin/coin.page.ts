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
import { Events } from '@ionic/angular';
import { WalletManager } from '../../services/WalletManager';
import { Native } from '../../services/Native';
import { Config } from '../../services/Config';
import { Util } from '../../services/Util';
import { ActivatedRoute } from '@angular/router';

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

    coinName = "";
    pageNo = 0;
    start = 0;

    textShow = '';

    elaPer: any;
    idChainPer: any;
    isShowMore = false;
    MaxCount = 0;
    isNodata: boolean = false;
    public myInterval: any;
    public jiajian: any = "";
    public votedCount = 0;

    maxHeight: any;
    curHeight: any;

    constructor(public route: ActivatedRoute, public walletManager: WalletManager, public native: Native, public events: Events) {
        //this.init();
        this.pageNo = 0;
        this.start = 0;
        this.MaxCount = 0;
        this.transferList = [];
        this.init();
    }
    ionViewWillEnter() {

    }

    ionViewDidLeave() {
        //clearInterval(this.myInterval);
    }
    init() {
        Config.coinObj = {};
        this.masterWalletId = Config.getCurMasterWalletId();
        this.walletManager.getMasterWalletBasicInfo(this.masterWalletId, (data) => {
            if (data["success"]) {
                this.native.info(data);
                let item = JSON.parse(data["success"])["Account"];
                this.masterWalletInfo = JSON.stringify(item);
                Config.coinObj.walletInfo = item;
            } else {
                alert("=======getMasterWalletBasicInfo====error=====" + JSON.stringify(data));
            }
        });

        this.route.paramMap.subscribe((params) => {
            this.coinName = params.get("name");
            Config.coinObj.chainId = this.coinName;
            this.elaPer = params.get("elaPer") || 0;
            this.idChainPer = params.get("idChainPer") || 0;
            if (this.coinName == 'ELA') {
                this.textShow = 'text-recharge';
            } else {
                this.textShow = 'text-withdraw';
            }
            this.maxHeight = Config.getEstimatedHeight(this.masterWalletId, this.coinName);
            this.curHeight = Config.getCurrentHeight(this.masterWalletId, this.coinName);

            this.initData();
        });
    }

    ngOnInit() {
    }

    initData() {
        this.walletManager.getBalance(this.masterWalletId, this.coinName, Config.total, (data) => {
            if (!Util.isNull(data["success"])) {
                this.native.info(data);
                this.coinCount = data["success"] / Config.SELA;
                // Config.coinObj.balance = data["success"];
            } else {
                this.native.info(data);
            }
        });

        if (this.coinName === "ELA") {
            this.walletManager.getBalance(this.masterWalletId, this.coinName, Config.voted, (data) => {
                if (!Util.isNull(data["success"])) {
                    this.native.info(data);
                    this.votedCount = data["success"] / Config.SELA;
                } else {
                    this.native.info(data);
                }
            });
        }
        this.getAllTx();

        // this.myInterval = setInterval(()=>{

        //   this.walletManager.getBalance(this.masterWalletId,this.coinName,0, (data)=>{
        //     if(!Util.isNull(data["success"])){
        //       this.native.info(data);
        //       this.coinCount = data["success"]/Config.SELA;
        //     }else{
        //       this.native.info(data);
        //     }
        //    });

        //       this.pageNo = 0;
        //       this.transferList =[];
        //       this.getAllTx();
        // },1000);
    }

    getAllTx() {
        this.walletManager.getAllTransaction(this.masterWalletId, this.coinName, this.start, '', (data) => {
            if (data["success"]) {
                let allTransaction = JSON.parse(data['success']);
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

                console.log(transactions);

                for (let key in transactions) {
                    let transaction = transactions[key];
                    let timestamp = transaction['Timestamp'] * 1000;
                    let datetime = Util.dateFormat(new Date(timestamp));
                    let txId = transaction['TxHash'];
                    let payStatusIcon = transaction["Direction"];
                    let name = "交易名称";//JSON.parse("{" + transaction["memo"] +"}").msg;;
                    let jiajian = "";
                    if (payStatusIcon === "Received") {
                        payStatusIcon = './assets/images/exchange-add.png';
                        jiajian = "+";
                    } else if (payStatusIcon === "Sent") {
                        payStatusIcon = './assets/images/exchange-sub.png';
                        jiajian = "-";
                    } else if (payStatusIcon === "Moved") {
                        payStatusIcon = './assets/images/exchange-sub.png';
                        jiajian = "";
                    } else if (payStatusIcon === "Deposit") {
                        payStatusIcon = './assets/images/exchange-sub.png';
                        if (transaction["Amount"] > 0) {
                            jiajian = "-";
                        } else {
                            jiajian = "";
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
                        "fuhao": jiajian
                    }
                    this.transferList.push(transfer);
                }
            } else {
                alert("====getAllTransaction====error");
            }
        });
    }

    onItem(item) {
        this.native.Go("/recordinfo", { chainId: this.coinName, txId: item.txId });
    }

    onNext(type) {

        switch (type) {
            case 1:
                this.native.Go("/receive", { id: this.coinId, chainId: this.coinName });
                break;
            case 2:
                Config.coinObj.transfer = {
                    toAddress: '',
                    amount: '',
                    memo: '',
                    fee: 0,
                    payPassword: '',//hptest
                    remark: '',
                };
                this.native.Go("/transfer");
                // if (this.coinName == 'ELA') {
                //     // if(this.elaPer != 1){
                //     //   this.messageBox("text-ela-per-message");
                //     //   return;
                //     // }
                //     this.native.Go("/transfer", { id: this.coinId, chainId: this.coinName, "walletInfo": this.masterWalletInfo });
                // } else {
                //     // if(this.idChainPer != 1){
                //     //   this.messageBox("text-ela-per-message");
                //     //   return;
                //     // }
                //     this.native.Go("/transfer", { id: this.coinId, chainId: this.coinName, "walletInfo": this.masterWalletInfo });
                // }

                break;
            case 3:
                if (this.coinName == 'ELA') {
                    // if(this.elaPer != 1){
                    //   this.messageBox("text-ela-per-message");
                    //   return;
                    // }
                    Config.coinObj.recharge = {
                        toAddress: '',
                        amount: '',
                        memo: '',
                        fee: 10000,
                        payPassword: '',
                        remark: '',
                    };
                    this.native.Go("/coin-select", { chainId: this.coinName, "walletInfo": this.masterWalletInfo });
                } else {
                    // if(this.idChainPer != 1){
                    //   this.messageBox("text-ela-per-message");
                    //   return;
                    // }
                    this.native.Go("/withdraw", { chainId: this.coinName, "walletInfo": this.masterWalletInfo });
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
        this.walletManager.getBalance(this.masterWalletId, this.coinName, Config.total, (data) => {
            if (!Util.isNull(data["success"])) {
                this.native.info(data);
                this.coinCount = data["success"] / Config.SELA;
            } else {
                this.native.info(data);
            }
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
