import { Component, OnInit, NgZone } from '@angular/core';
import { WalletManager } from '../../../services/WalletManager';
import { Native } from '../../../services/Native';
import { ActivatedRoute } from '@angular/router';
import { LocalStorage } from '../../../services/Localstorage';
import { Util } from "../../../services/Util";
import { Config } from '../../../services/Config';
import { IDManager } from "../../../services/IDManager";
import { ApiUrl } from "../../../services/ApiUrl"
import { ModalController, Events } from '@ionic/angular';
import { PaymentboxPage } from '../../paymentbox/paymentbox.page';

@Component({
    selector: 'app-transfer',
    templateUrl: './transfer.page.html',
    styleUrls: ['./transfer.page.scss'],
})
export class TransferPage implements OnInit {
    masterWalletId: string = "1";
    walletType = "";
    transfer: any = {
        toAddress: '',
        amount: '',
        memo: '',
        fee: 0,
        payPassword: '',//hptest
        remark: '',
    };

    balance = 0;

    chainId: string;

    feePerKb = 10000;

    rawTransaction: '';

    SELA = Config.SELA;
    appType: string = null;
    selectType: string = "";
    parms: any;
    txId: string;
    did: string;
    isInput = false;
    walletInfo = {};
    useVotedUTXO: boolean = false;
    constructor(public route: ActivatedRoute, public walletManager: WalletManager,
        public native: Native, public localStorage: LocalStorage, public modalCtrl: ModalController, public events: Events, public zone: NgZone) {
        this.init();
    }

    ngOnInit() {
    }

    init() {
        console.log(Config.coinObj);
        this.transfer = Config.coinObj.transfer;
        this.chainId = Config.coinObj.chainId;
        this.walletInfo = Config.coinObj.walletInfo;
        this.events.subscribe("address:update", (address) => {
            this.transfer.toAddress = address;
        });
        this.masterWalletId = Config.getCurMasterWalletId();
        // this.route.paramMap.subscribe((params) => {
        // // this.route.queryParams.subscribe((data) => {
        //     let transferObj = params;
        //     this.chainId = transferObj.get("chainId");
        //     this.transfer.toAddress = transferObj.get("addr") || "";
        //     this.transfer.amount = transferObj.get("money") || "";
        //     this.appType = transferObj.get("appType") || "";
        //     if (this.appType == "") {
        //         this.isInput = false;
        //     } else {
        //         this.isInput = true;
        //     }
        //     this.selectType = transferObj.get("selectType") || "";
        //     this.parms = transferObj.get("parms") || "";
        //     this.did = transferObj.get("did") || "";
        //     this.walletInfo = JSON.parse(transferObj.get("walletInfo")) || {};
        this.initData();
        // });
    }

    updateUseVotedUTXO(useVotedUTXO) {
        this.zone.run(() => {
            this.useVotedUTXO = useVotedUTXO;
        });
    }

    rightHeader() {
        console.log(Config.coinObj.transfer);
        this.native.Go("/scan", { "pageType": "1" });
    }

    initData() {
        this.walletManager.getBalance(this.masterWalletId, this.chainId, Config.total, (data) => {
            if (!Util.isNull(data["success"])) {
                this.balance = data["success"];
            } else {
                alert("===getBalance===error" + JSON.stringify(data));
            }
        });
    }


    onClick(type) {
        switch (type) {
            case 1:
                this.native.Go("/contact-list", { "hideButton": true });
                break;
            case 2:   // 转账
                this.checkValue();
                break;
        }

    }

    checkValue() {
        if (Util.isNull(this.transfer.toAddress)) {
            this.native.toast_trans('correct-address');
            return;
        }
        if (Util.isNull(this.transfer.amount)) {
            this.native.toast_trans('amount-null');
            return;
        }
        if (!Util.number(this.transfer.amount)) {
            this.native.toast_trans('correct-amount');
            return;
        }

        if (this.transfer.amount <= 0) {
            this.native.toast_trans('correct-amount');
            return;
        }

        if (this.transfer.amount > this.balance) {
            this.native.toast_trans('error-amount');
            return;
        }

        if (this.transfer.amount.toString().indexOf(".") > -1 && this.transfer.amount.toString().split(".")[1].length > 8) {
            this.native.toast_trans('correct-amount');
            return;
        }


        this.walletManager.isAddressValid(this.masterWalletId, this.transfer.toAddress, (data) => {
            if (!data['success']) {
                this.native.toast_trans("contact-address-digits");
                return;
            }
            this.native.showLoading().then(() => {
                if (this.walletInfo["Type"] === "Standard") {
                    this.createTransaction();
                } else if (this.walletInfo["Type"] === "Multi-Sign") {
                    this.createMultTx();
                }
            });
        });
    }

    createTransaction() {
        let toAmount = 0;
        //toAmount = parseFloat((this.transfer.amount*Config.SELA).toPrecision(16));
        toAmount = this.accMul(this.transfer.amount, Config.SELA);

        this.walletManager.createTransaction(this.masterWalletId, this.chainId, "",
            this.transfer.toAddress,
            toAmount,
            this.transfer.memo,
            this.transfer.remark,
            this.useVotedUTXO,
            (data) => {
                if (data['success']) {
                    this.native.info(data);
                    this.rawTransaction = data['success'];
                    this.getFee();
                } else {
                    this.native.info(data);
                }
            });
    }

    getFee() {
        this.walletManager.calculateTransactionFee(this.masterWalletId, this.chainId, this.rawTransaction, this.feePerKb, (data) => {
            if (data['success']) {
                this.native.hideLoading();
                this.native.info(data);
                this.transfer.fee = data['success'];
                this.openPayModal(this.transfer);
            } else {
                this.native.info(data);
            }
        });
    }

    sendRawTransaction() {
        if (this.walletInfo["Type"] === "Multi-Sign" && this.walletInfo["InnerType"] === "Readonly") {
            this.updateTxFee();
            return;
        }
        this.updateTxFee();
    }

    updateTxFee() {
        this.walletManager.updateTransactionFee(this.masterWalletId, this.chainId, this.rawTransaction, this.transfer.fee, "", (data) => {
            if (data["success"]) {
                this.native.info(data);
                if (this.walletInfo["Type"] === "Multi-Sign" && this.walletInfo["InnerType"] === "Readonly") {
                    this.readWallet(data["success"]);
                    return;
                }
                this.singTx(data["success"]);
            } else {
                this.native.info(data);
            }
        });
    }

    singTx(rawTransaction) {
        this.walletManager.signTransaction(this.masterWalletId, this.chainId, rawTransaction, this.transfer.payPassword, (data) => {
            if (data["success"]) {
                this.native.info(data);
                if (this.walletInfo["Type"] === "Standard") {
                    this.sendTx(data["success"]);
                } else if (this.walletInfo["Type"] === "Multi-Sign") {
                    this.walletManager.encodeTransactionToString(data["success"], (raw) => {
                        if (raw["success"]) {
                            this.native.hideLoading();
                            this.native.Go("/scancode", { "tx": { "chainId": this.chainId, "fee": this.transfer.fee / Config.SELA, "raw": raw["success"] } });
                        } else {
                            this.native.info(raw);
                        }
                    });
                }
            } else {
                this.native.info(data);
            }
        });
    }

    sendTx(rawTransaction) {
        this.native.info(rawTransaction);
        this.walletManager.publishTransaction(this.masterWalletId, this.chainId, rawTransaction, (data) => {
            if (data["success"]) {
                this.native.hideLoading();
                this.native.info(data);
                this.txId = JSON.parse(data['success'])["TxHash"];
                if (Util.isNull(this.appType)) {
                    this.native.toast_trans('send-raw-transaction');
                    this.native.setRootRouter("/tabs");
                } else if (this.appType === "kyc") {
                    if (this.selectType === "enterprise") {
                        this.company();
                    } else {
                        this.person();
                    }
                }
            } else {
                this.native.info(data);
            }
        })
    }

    company() {
        this.sendCompanyHttp(this.parms);
    }

    person() {
        this.sendPersonAuth(this.parms);
    }

    sendCompanyHttp(params) {
        let timestamp = this.native.getTimestamp();
        params["timestamp"] = timestamp;
        params["txHash"] = this.txId;
        params["deviceID"] = Config.getdeviceID();
        let checksum = IDManager.getCheckSum(params, "asc");
        params["checksum"] = checksum;

        console.info("ElastJs sendCompanyHttp params " + JSON.stringify(params));
        this.native.getHttp().postByAuth(ApiUrl.AUTH, params).toPromise().then(data => {
            if (data["status"] === 200) {
                let authData = JSON.parse(data["_body"]);
                console.info("Elastjs sendCompanyHttp authData" + JSON.stringify(authData));
                if (authData["errorCode"] === "0") {
                    let serialNum = authData["serialNum"];
                    let serIds = Config.getSerIds();
                    serIds[serialNum] = {
                        "id": this.did,
                        "path": this.selectType,
                        "serialNum": serialNum,
                        "txHash": this.txId
                    };
                    Config.setSerIds(serIds);
                    this.saveKycSerialNum(serialNum);
                } else {
                    alert("sendCompanyHttp 错误码:" + authData["errorCode"]);
                }
            }

        }).catch(error => {
            alert("错误码:" + JSON.stringify(error));
            this.native.Go("/id-result", { 'status': '1' });
        });
    }

    sendPersonAuth(parms) {
        let timestamp = this.native.getTimestamp();
        parms["timestamp"] = timestamp;
        parms["txHash"] = this.txId;
        parms["deviceID"] = Config.getdeviceID();
        let checksum = IDManager.getCheckSum(parms, "asc");
        parms["checksum"] = checksum;
        this.native.info(parms);

        this.native.getHttp().postByAuth(ApiUrl.AUTH, parms).toPromise().then(data => {
            if (data["status"] === 200) {
                let authData = JSON.parse(data["_body"])
                console.log('ElastJs sendPersonAuth return data ---authData---' + JSON.stringify(authData));
                if (authData["errorCode"] === "0") {

                    console.log('ElastJs sendPersonAuth errorCode == 0');

                    let serialNum = authData["serialNum"];
                    let serIds = Config.getSerIds();
                    serIds[serialNum] = {
                        "id": this.did,
                        "path": this.selectType,
                        "serialNum": serialNum,
                        "txHash": this.txId
                    }
                    console.log('ElastJs sendPersonAuth selectType ' + this.selectType + " serialNum " + serialNum);
                    Config.setSerIds(serIds);
                    this.saveKycSerialNum(serialNum);
                } else {
                    alert("错误码:" + authData["errorCode"]);
                }
            }
        }).catch(error => {

        });
        this.native.Go("/id-result", { 'status': '0' });
    }

    saveKycSerialNum(serialNum) {
        console.log('ElastJs saveKycSerialNum serialNum begin' + serialNum);

        this.localStorage.get("kycId").then((val) => {
            let idsObj = JSON.parse(val);
            let serialNumObj = idsObj[this.did][this.selectType][serialNum];
            serialNumObj["txHash"] = this.txId;
            serialNumObj["pathStatus"] = 1;
            this.localStorage.set("kycId", idsObj).then((newVal) => {
                this.native.Go("/id-result", { 'status': '0', id: this.did, path: this.selectType });
            });
        })
    }

    createMultTx() {

        let toAmount = 0;
        //toAmount = parseFloat((this.transfer.amount*Config.SELA).toPrecision(16));
        toAmount = this.accMul(this.transfer.amount, Config.SELA);
        this.walletManager.createMultiSignTransaction(this.masterWalletId, this.chainId, "",
            this.transfer.toAddress,
            toAmount,
            this.transfer.memo,
            this.transfer.remark,
            this.useVotedUTXO,
            (data) => {
                if (data["success"]) {
                    this.native.info(data);
                    this.rawTransaction = data['success'];
                    this.getFee();
                } else {
                    this.native.info(data);
                }
            }
        )
    }

    readWallet(raws) {
        this.walletManager.encodeTransactionToString(raws, (raw) => {
            if (raw["success"]) {
                this.native.hideLoading();
                this.native.Go("/scancode", { "tx": { "chainId": this.chainId, "fee": this.transfer.fee / Config.SELA, "raw": raw["success"] } });
            } else {
                alert("=====encodeTransactionToString===error===" + JSON.stringify(raw));
            }
        });
    }

    // ionViewDidLeave() {
    //    this.events.unsubscribe("error:update");
    // }

    async openPayModal(transfer) {
        let props = this.native.clone(transfer);
        console.log(props);
        const modal = await this.modalCtrl.create({
            component: PaymentboxPage,
            componentProps: props
        });
        modal.onDidDismiss().then((data) => {if (data) {
            this.native.showLoading().then(() => {
                this.transfer.payPassword = data;
                this.sendRawTransaction();
            });
        }});
        // const { data } = await modal.onDidDismiss();
        // if (data) {
        //     this.native.showLoading().then(() => {
        //         this.transfer = this.native.clone(data);
        //         this.sendRawTransaction();
        //     });
        // }
        return modal.present();
    }



    accMul(arg1, arg2) {
        let m = 0, s1 = arg1.toString(), s2 = arg2.toString();
        try { m += s1.split(".")[1].length } catch (e) { }
        try { m += s2.split(".")[1].length } catch (e) { }
        return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
    }

}

