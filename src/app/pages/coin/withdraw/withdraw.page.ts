import { Component, OnInit, NgZone } from '@angular/core';
import { WalletManager } from '../../../services/WalletManager';
import { Native } from '../../../services/Native';
import { LocalStorage } from '../../../services/Localstorage';
import { Util } from "../../../services/Util";
import { Config } from '../../../services/Config';
import { ApiUrl } from "../../../services/ApiUrl"
import { ModalController, Events } from '@ionic/angular';
import { PaymentboxComponent } from '../../../components/paymentbox/paymentbox.component';

@Component({
    selector: 'app-withdraw',
    templateUrl: './withdraw.page.html',
    styleUrls: ['./withdraw.page.scss'],
})
export class WithdrawPage implements OnInit {

    masterWalletId: string = "1";
    transfer: any = {};

  mainchain: any = {
    accounts: '',
    amounts: 0,
    index: 0,
    rate: 1,
  };
    balance = 0;

    chainId: string;

    feePerKb = 10000;

    rawTransaction: '';

    SELA = Config.SELA;

    walletInfo = {};

    constructor(public walletManager: WalletManager,
        public native: Native, public localStorage: LocalStorage, public modalCtrl: ModalController, public events: Events, public zone: NgZone) {

    }

    ngOnInit() {
    }

    init() {
        this.events.subscribe("address:update", (address) => {
            this.transfer.toAddress = address;
        });
        this.masterWalletId = Config.getCurMasterWalletId();
        this.walletInfo = Config.coinObj.walletInfo;
        this.chainId = Config.coinObj.chainId;
            this.initData();

    }

    rightHeader() {
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


    onClick() {
        this.checkValue();
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
                this.createWithdrawTransaction();
            });
        });
    }

    createWithdrawTransaction() {
        let toAmount = 0;
        //toAmount = parseFloat((this.transfer.amount*Config.SELA).toPrecision(16));
        toAmount = this.accMul(this.transfer.amount, Config.SELA);

        this.walletManager.createWithdrawTransaction(this.masterWalletId, this.chainId, "",
            toAmount,
            this.transfer.toAddress,

            this.transfer.memo,
            this.transfer.remark,
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
                this.transfer.rate = this.mainchain.rate;
                this.openPayModal(this.transfer);
            } else {
                this.native.info(data);
            }
        });
    }

    sendRawTransaction() {
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
        this.walletManager.publishTransaction(this.masterWalletId, this.chainId, rawTransaction, (data) => {
            if (data["success"]) {
                this.native.hideLoading();
                this.native.info(data);
                this.native.setRootRouter("/tabs");
            } else {
                this.native.info(data);
            }
        })
    }

    async openPayModal(transfer) {
        let props = this.native.clone(transfer);
        const modal = await this.modalCtrl.create({
            component: PaymentboxComponent,
            componentProps: props
        });
        modal.onDidDismiss().then((params) => {if (params.data) {
            this.native.showLoading().then(() => {
                this.transfer.payPassword = params.data;
                this.sendRawTransaction();
            });
        }});
        return await modal.present();
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




    accMul(arg1, arg2) {
        let m = 0, s1 = arg1.toString(), s2 = arg2.toString();
        try { m += s1.split(".")[1].length } catch (e) { }
        try { m += s2.split(".")[1].length } catch (e) { }
        return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
    }

}
