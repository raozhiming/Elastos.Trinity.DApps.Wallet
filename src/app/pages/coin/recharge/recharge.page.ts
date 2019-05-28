import { Component, OnInit } from '@angular/core';
import { Util } from "../../../services/Util";
import { Config } from '../../../services/Config';
import { NavController, ModalController, Events } from '@ionic/angular';
import { WalletManager } from '../../../services/WalletManager';
import { Native } from '../../../services/Native';
import { LocalStorage } from '../../../services/Localstorage';
import { ActivatedRoute } from '@angular/router';
import { PaymentboxPage } from '../../paymentbox/paymentbox.page';

@Component({
    selector: 'app-recharge',
    templateUrl: './recharge.page.html',
    styleUrls: ['./recharge.page.scss'],
})
export class RechargePage implements OnInit {
    masterWalletId: string = "1";

    transfer: any = {
        toAddress: '',
        amount: '',
        memo: '',
        fee: 10000,
        payPassword: '',
        remark: '',
    };

    sidechain: any = {
        accounts: '',
        amounts: 0,
        index: 0,
        rate: 1,
    };


    balance = 0;

    chianId: string;

    feePerKb = 10000;

    rawTransaction: '';

    SELA = Config.SELA;
    walletInfo = {};
    constructor(public navCtrl: NavController, public route: ActivatedRoute, public walletManager: WalletManager,
        public native: Native, public localStorage: LocalStorage, public modalCtrl: ModalController, public events: Events) {
        this.init();
    }

    ngOnInit() {
    }
    init() {
        this.events.subscribe("address:update", (address) => {
            this.sidechain.accounts = address;
        });
        this.masterWalletId = Config.getCurMasterWalletId();
        this.route.queryParams.subscribe((data) => {
            let transferObj = data;
            this.walletInfo = transferObj["walletInfo"] || {};
            this.chianId = transferObj["chianId"];
        });
        this.getGenesisAddress();
        this.initData();
    }

    rightHeader() {
        this.native.Go(this.navCtrl, "/scan", { "pageType": "1" });
    }

    initData() {
        this.walletManager.getBalance(this.masterWalletId, 'ELA', Config.total, (data) => {
            if (!Util.isNull(data["success"])) {
                this.native.info(data);
                this.balance = data["success"];
            } else {
                this.native.info(data);
            }
        });
    }


    onClick(type) {
        switch (type) {
            // case 1:
            //   this.Go(ContactListComponent);
            //   break;
            case 2:   // 转账
                this.checkValue();
                break;
        }
    }

    checkValue() {
        if (Util.isNull(this.sidechain.accounts)) {
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
        this.walletManager.isAddressValid(this.masterWalletId, this.sidechain.accounts, (data) => {
            if (!data['success']) {
                this.native.toast_trans("contact-address-digits");
                return;
            }
            this.native.showLoading().then(() => {
                this.createDepositTransaction();
            });

        })
    }


    createDepositTransaction() {
        let toAmount = 0;
        //toAmount = parseFloat((this.transfer.amount*Config.SELA).toPrecision(16));
        toAmount = this.accMul(this.transfer.amount, Config.SELA);
        let sidechainAddress = this.sidechain.accounts;
        this.walletManager.createDepositTransaction(this.masterWalletId, 'ELA', "",
            this.transfer.toAddress, // genesisAddress
            toAmount, // user input amount
            sidechainAddress, // user input address
            this.transfer.memo,
            this.transfer.remark,
            false,
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

    getGenesisAddress() {
        this.walletManager.getGenesisAddress(this.masterWalletId, this.chianId, (data) => {
            this.transfer.toAddress = data['success'];
        });
    }

    getFee() {
        this.walletManager.calculateTransactionFee(this.masterWalletId, 'ELA', this.rawTransaction, this.feePerKb, (data) => {
            if (data['success']) {
                this.native.hideLoading();
                this.native.info(data);
                this.transfer.fee = data['success'];
                this.transfer.rate = this.sidechain.rate;
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
        this.walletManager.updateTransactionFee(this.masterWalletId, 'ELA', this.rawTransaction, this.transfer.fee, "", (data) => {
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
        this.walletManager.signTransaction(this.masterWalletId, 'ELA', rawTransaction, this.transfer.payPassword, (data) => {
            if (data["success"]) {
                this.native.info(data);
                if (this.walletInfo["Type"] === "Standard") {
                    this.sendTx(data["success"]);
                } else if (this.walletInfo["Type"] === "Multi-Sign") {
                    this.walletManager.encodeTransactionToString(data["success"], (raw) => {
                        if (raw["success"]) {
                            this.native.hideLoading();
                            this.native.Go(this.navCtrl, "/scancode", { "tx": { "chianId": 'ELA', "fee": this.transfer.fee / Config.SELA, "raw": raw["success"] } });
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
        this.walletManager.publishTransaction(this.masterWalletId, 'ELA', rawTransaction, (data) => {
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
        props["accounts"] = this.sidechain.accounts;

        const modal = await this.modalCtrl.create({
            component: PaymentboxPage,
            componentProps: props
        });
        const { data } = await modal.onDidDismiss();
        if (data) {
            this.native.showLoading().then(() => {
                this.transfer = this.native.clone(data);
                this.sendRawTransaction();
            });
        }
        return await modal.present();
    }

    readWallet(raws) {
        this.walletManager.encodeTransactionToString(raws, (raw) => {
            if (raw["success"]) {
                this.native.hideLoading();
                this.native.Go(this.navCtrl, "/scancode", { "tx": { "chianId": 'ELA', "fee": this.transfer.fee / Config.SELA, "raw": raw["success"] } });
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

