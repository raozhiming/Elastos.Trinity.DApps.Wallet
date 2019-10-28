import { Component, OnInit } from '@angular/core';
import { Config } from '../../../services/Config';
import { Util } from '../../../services/Util';
import { WalletManager } from '../../../services/WalletManager';
import { Native } from '../../../services/Native';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-recordinfo',
    templateUrl: './recordinfo.page.html',
    styleUrls: ['./recordinfo.page.scss'],
})
export class RecordinfoPage implements OnInit {
    masterWalletId: string = "1";
    transactionRecord: any = {};
    start = 0;
    payStatusIcon: string = "";
    blockchain_url = Config.BLOCKCHAIN_URL;
    public myInterval: any;
    public jiajian: any = "";
    public inputs: any = [];
    public outputs: any = [];
    constructor(public route: ActivatedRoute, public walletManager: WalletManager, public native: Native) {
        //this.init();
    }

    ngOnInit() {
    }

    ionViewWillEnter() {
        this.init();
        // this.myInterval = setInterval(()=>{
        //     this.init();
        // },1000);
    }

    ionViewDidLeave() {
        // clearInterval(this.myInterval);
    }
    init() {
        this.masterWalletId = Config.getCurMasterWalletId();
        this.route.queryParams.subscribe((data) => {
            let txId = data["txId"];
            let chainId = data["chainId"];
            this.walletManager.getAllTransaction(this.masterWalletId, chainId, this.start, txId, (ret) => {
                let allTransaction = ret;
                let transactions = allTransaction['Transactions'];
                let transaction = transactions[0];
                this.inputs = this.objtoarr(transaction["Inputs"]);
                // console.log("===this===" + JSON.stringify(this.inputs));
                this.outputs = this.objtoarr(transaction["Outputs"]);
                // console.log("===this===" + JSON.stringify(this.outputs));
                let timestamp = transaction['Timestamp'] * 1000;
                let datetime = Util.dateFormat(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
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


                let vtype = "";
                switch (transaction["Type"]) {
                    case 0:
                        vtype = "transaction-type-0";
                        break;
                    case 1:
                        vtype = "transaction-type-1";
                        break;
                    case 2:
                        vtype = "transaction-type-2";
                        break;
                    case 3:
                        vtype = "transaction-type-3";
                        break;
                    case 4:
                        vtype = "transaction-type-4";
                        break;
                    case 5:
                        vtype = "transaction-type-5";
                        break;
                    case 6:
                        vtype = "transaction-type-6";
                        break;
                    case 7:
                        vtype = "transaction-type-7";
                        break;
                    case 8:
                        vtype = "transaction-type-8";
                        break;
                    case 9:
                        vtype = "transaction-type-9";
                        break;
                    case 10:
                        vtype = "transaction-type-10";
                        break;
                    case 11:
                        vtype = "transaction-type-11";
                        break;
                    case 12:
                        vtype = "transaction-type-12";
                        break;
                    default:
                        vtype = "transaction-type-13";
                }
                let payStatusIcon = transaction["Direction"];
                if (payStatusIcon === "Received") {
                    this.payStatusIcon = './assets/images/tx-state/icon-tx-received-outline.svg';
                    this.jiajian = "+";
                } else if (payStatusIcon === "Sent") {
                    this.payStatusIcon = './assets/images/tx-state/icon-tx-sent.svg';
                    this.jiajian = "-";
                } else if (payStatusIcon === "Moved") {
                    this.payStatusIcon = './assets/images/tx-state/icon-tx-moved.svg';
                    this.jiajian = "";
                } else if (payStatusIcon === "Deposit") {
                    this.payStatusIcon = './assets/images/tx-state/icon-tx-moved.svg';
                    if (transaction["Amount"] > 0) {
                        this.jiajian = "-";
                    } else {
                        this.jiajian = "";
                    }
                }

                this.transactionRecord = {
                    name: chainId,
                    status: status,
                    resultAmount: Util.scientificToNumber(transaction["Amount"] / Config.SELA),
                    txId: txId,
                    transactionTime: datetime,
                    timestamp: timestamp,
                    payfees: Util.scientificToNumber(transaction['Fee'] / Config.SELA),
                    confirmCount: transaction["ConfirmStatus"],
                    memo: transaction["Memo"],
                    payType: vtype
                }

            });
        });


    }

    onNext(address) {
        this.native.copyClipboard(address);
        this.native.toast_trans('copy-ok');
    }

    tiaozhuan(txId) {
        // self.location.href = this.blockchain_url + 'tx/' + txId;
        this.native.openUrl(this.blockchain_url + 'tx/' + txId)
    }

    doRefresh(event) {
        this.init();
        setTimeout(() => {
            event.target.complete();
        }, 1000);
    }

    objtoarr(obj) {
        let arr = []
        if (obj) {
            for (let i in obj) {
                if (arr.length < 3)
                    arr.push({ "address": i, "balance": obj[i] / Config.SELA });
            }

            if (arr.length > 2) {
                arr.push({ "address": "...........", "balance": "............." });
                return arr;
            }
        }
        return arr;
    }

}

