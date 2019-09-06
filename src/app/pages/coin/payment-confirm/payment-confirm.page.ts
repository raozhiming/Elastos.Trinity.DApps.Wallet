import { Component, OnInit } from '@angular/core';
import { Util } from "../../../services/Util";
import { Config } from '../../../services/Config';
import { ModalController, Events } from '@ionic/angular';
import { WalletManager } from '../../../services/WalletManager';
import { Native } from '../../../services/Native';
import { LocalStorage } from '../../../services/Localstorage';
import { PaymentboxComponent } from '../../../components/paymentbox/paymentbox.component';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-payment-confirm',
    templateUrl: './payment-confirm.page.html',
    styleUrls: ['./payment-confirm.page.scss'],
})
export class PaymentConfirmPage implements OnInit {
    masterWalletId: string = "1";
    transfer: any = {
        toAddress: '',
        amount: '',
        memo: '',
        fee: 0,
        payPassword: '',
    };

    chainId: string = 'ELA';

    feePerKb = 10000;

    rawTransaction: '';

    SELA = Config.SELA;

    txId: string;

    balance: 0;

    information: string;
    constructor(public route: ActivatedRoute, public walletManager: WalletManager,
        public native: Native, public localStorage: LocalStorage, public modalCtrl: ModalController, public events: Events) {
        this.init();
    }

    ngOnInit() {
    }

    init() {
        this.masterWalletId = Config.getCurMasterWalletId();
        this.getAllSubWallets();
        this.route.queryParams.subscribe((data) => {
            let account = this.GetQueryString("account") || data["account"];
            let toAddress = this.GetQueryString("address") || data["address"];
            let memo = this.GetQueryString("memo") || data["memo"];
            let information = this.GetQueryString("information");
            this.transfer.amount = account;
            this.transfer.toAddress = toAddress;
            this.transfer.memo = memo;
            this.information = information;
        });
    }

    getAllSubWallets() {
        this.walletManager.getAllSubWallets(this.masterWalletId);
    }

    GetQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURI(r[2]); return null;
    }

    onClick(type) {
        switch (type) {
            case 1:
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
        if (this.transfer.amount > this.balance) {
            this.native.toast_trans('error-amount');
            return;
        }
        this.walletManager.isAddressValid(this.masterWalletId, this.transfer.toAddress, () => {
            this.native.showLoading().then(() => {
                this.createTransaction();
            });
        },
            () => { this.native.toast_trans("contact-address-digits"); }
        );
    }

    createTransaction() {
        this.walletManager.createTransaction(this.masterWalletId, this.chainId, "",
            this.transfer.toAddress,
            this.transfer.amount,
            this.transfer.memo,
            false,
            (ret) => {
                this.rawTransaction = ret;
                this.openPayModal(this.transfer);
            });
    }

    singTx() {
        this.walletManager.signTransaction(this.masterWalletId, this.chainId, this.rawTransaction, this.transfer.payPassword, (ret) => {
            this.sendTx(ret);
        });
    }

    sendTx(rawTransaction) {
        this.native.info(rawTransaction);
        this.walletManager.publishTransaction(this.masterWalletId, this.chainId, rawTransaction, (ret) => {
            this.native.hideLoading();
            this.txId = JSON.parse(ret)["TxHash"];
            let result = {
                txId: this.txId
            }
            // return result; //TODO::??
            this.native.setRootRouter("/tabs");
        })
    }

    async openPayModal(transfer) {
        let props = this.native.clone(transfer);
        const modal = await this.modalCtrl.create({
            component: PaymentboxComponent,
            componentProps: props
        });
        const { data } = await modal.onDidDismiss();
        if (data) {
            this.native.showLoading().then(() => {
                this.transfer = this.native.clone(data);
                this.singTx();
            });
        }
        return await modal.present();
    }


}
