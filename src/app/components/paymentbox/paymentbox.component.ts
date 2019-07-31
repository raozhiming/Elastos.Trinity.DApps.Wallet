import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Config } from '../../services/Config';
import { Native } from '../../services/Native';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-paymentbox',
    templateUrl: './paymentbox.component.html',
    styleUrls: ['./paymentbox.component.scss'],
})
export class PaymentboxComponent implements OnInit {
    public SELA = Config.SELA;
    public toAddress = "";
    public walltype: boolean = false;
    public transfer: any = {
        toAddress: '',
        amount: '',
        memo: '',
        fee: 0,
        payPassword: '',//hptest
        remark: '',
        rate: ''
    };
    constructor(public route: ActivatedRoute, public modalCtrl: ModalController,
        public navParams: NavParams,
        public native: Native) {
        let masterId = Config.getCurMasterWalletId();
        let accountObj = Config.getAccountType(masterId);
        if (accountObj["Type"] === "Multi-Sign" && accountObj["InnerType"] === "Readonly") {
            this.walltype = false;
        } else {
            this.walltype = true;
        }

        this.transfer = this.navParams.data;
        console.log(this.transfer);
        if (this.transfer["rate"]) {
            this.toAddress = this.transfer["accounts"];
        } else {
            this.toAddress = this.transfer["toAddress"];
        }
        // this.route.queryParams.subscribe((data) => {
        //     console.log(data);
        //     this.transfer = data;
        //     if (this.transfer["rate"]) {
        //         this.toAddress = this.transfer["accounts"];
        //     } else {
        //         this.toAddress = this.transfer["toAddress"];
        //     }
        // });
    }

    ngOnInit() {

    }

    ionViewWillEnter() {
        this.transfer.payPassword = '';
    }

    click_close() {
        this.modalCtrl.dismiss(null);
    }

    click_button() {
        //this.viewCtrl.dismiss(this.transfer);
        if (!this.walltype) {
            this.modalCtrl.dismiss(this.transfer);
            return;
        }
        if (this.transfer.payPassword) {
            this.modalCtrl.dismiss(this.transfer.payPassword);
        } else {
            this.native.toast_trans('text-pwd-validator');
        }
    }

}
