import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Config } from '../../../services/Config';
import { Native } from '../../../services/Native';
import { Util } from '../../../services/Util';
import { WalletManager } from '../../../services/WalletManager';

@Component({
    selector: 'app-recordinfo',
    templateUrl: './recordinfo.page.html',
    styleUrls: ['./recordinfo.page.scss'],
})
export class RecordinfoPage implements OnInit {
    masterWalletId = '';
    chainId = '';
    txId = '';
    transactionRecord: any = {};
    start = 0;
    payStatusIcon: string = '';
    blockchain_url = Config.BLOCKCHAIN_URL;
    idchain_url = Config.IDCHAIN_URL;

    public symbol: any = '';
    public inputs: any = [];
    public outputs: any = [];

    //TODO: it should use callback if the spvsdk can send callback when the confirm count is 6
    autoFefreshInterval: any = null;
    preConfirmCount = '';

    constructor(public route: ActivatedRoute, public walletManager: WalletManager, public native: Native) {
    }

    ngOnInit() {
    }

    ionViewWillEnter() {
        this.init();
    }

    ionViewDidLeave() {
        this.closeRefreshTimer();
    }

    init() {
        this.masterWalletId = Config.getCurMasterWalletId();
        this.route.queryParams.subscribe((data) => {
            this.txId = data["txId"];
            this.chainId = data["chainId"];

            this.getTransactionInfo();
        });
    }

    getTransactionInfo() {
        this.walletManager.getAllTransaction(this.masterWalletId, this.chainId, this.start, this.txId, (ret) => {
            let allTransaction = ret;
            let transactions = allTransaction['Transactions'];
            let transaction = transactions[0];
            this.inputs = this.objtoarr(transaction["Inputs"]);
            this.outputs = this.objtoarr(transaction["Outputs"]);
            let timestamp = transaction['Timestamp'] * 1000;
            let datetime = Util.dateFormat(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
            let status = '';

            switch (transaction["Status"]) {
                case 'Confirmed':
                    status = 'Confirmed';
                    this.closeRefreshTimer();
                    break;
                case 'Pending':
                    status = 'Pending';
                    this.startRefreshTimer();
                    break;
                case 'Unconfirmed':
                    status = 'Unconfirmed';
                    this.startRefreshTimer();
                    break;
            }

            if (this.preConfirmCount === transaction["ConfirmStatus"]) {
                //do nothing
                console.log('getTransactionInfo do nothing ConfirmStatus:', transaction["ConfirmStatus"]);
                return;
            } else {
                this.preConfirmCount = transaction["ConfirmStatus"];
            }

            let vtype = "transaction-type-13";
            if ((transaction["Type"] >= 0) && transaction["Type"] <= 12) {
                if (transaction["Type"] === 10) {
                    if (this.chainId === 'IDChain') {
                        vtype = "transaction-type-did";
                    } else {
                        vtype = "transaction-type-10";
                    }
                } else {
                    vtype = "transaction-type-" + transaction["Type"];
                }
            }

            let payStatusIcon = transaction["Direction"];
            if (payStatusIcon === "Received") {
                this.payStatusIcon = './assets/images/tx-state/icon-tx-received-outline.svg';
                this.symbol = "+";
            } else if (payStatusIcon === "Sent") {
                this.payStatusIcon = './assets/images/tx-state/icon-tx-sent.svg';
                this.symbol = "-";
            } else if (payStatusIcon === "Moved") {
                this.payStatusIcon = './assets/images/tx-state/icon-tx-moved.svg';
                this.symbol = "";
            } else if (payStatusIcon === "Deposit") {
                this.payStatusIcon = './assets/images/tx-state/icon-tx-moved.svg';
                if (transaction["Amount"] > 0) {
                    this.symbol = "-";
                } else {
                    this.symbol = "";
                }
            }

            //for vote transaction
            if (!Util.isNull(transaction['OutputPayload']) && (transaction['OutputPayload'].length > 0)) {
                vtype = "transaction-type-vote";
            }

            this.transactionRecord = {
                name: this.chainId,
                status: status,
                resultAmount: Util.scientificToNumber(transaction["Amount"] / Config.SELA),
                txId: this.txId,
                transactionTime: datetime,
                timestamp: timestamp,
                payfees: Util.scientificToNumber(transaction['Fee'] / Config.SELA),
                confirmCount: transaction["ConfirmStatus"],
                memo: transaction["Memo"],
                payType: vtype
            };
        });
    }

    startRefreshTimer() {
        if (this.autoFefreshInterval == null) {
            this.autoFefreshInterval = setInterval(() => {
                this.getTransactionInfo();
            }, 30000); // 30s
        }
    }
    closeRefreshTimer() {
        if (this.autoFefreshInterval) {
            clearInterval(this.autoFefreshInterval);
            this.autoFefreshInterval = null;
        }
    }

    copyAddress(address) {
        this.native.copyClipboard(address);
        this.native.toast_trans('copy-ok');
    }

    goWebSite(chainId, txId) {
        if (chainId === 'ELA') {
            this.native.openUrl(this.blockchain_url + 'tx/' + txId);
        } else {
            this.native.openUrl(this.idchain_url + 'tx/' + txId);
        }
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

