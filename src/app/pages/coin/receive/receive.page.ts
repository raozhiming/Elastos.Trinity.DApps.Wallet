import { Component, OnInit } from '@angular/core';
import { Util } from "../../../services/Util";
import { Config } from '../../../services/Config';
import { WalletManager } from '../../../services/WalletManager';
import { Native } from '../../../services/Native';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-receive',
    templateUrl: './receive.page.html',
    styleUrls: ['./receive.page.scss'],
})
export class ReceivePage implements OnInit {

    masterWalletId: string = "1";
    qrcode: string = null;
    address: Number;
    amount: Number;
    chainId: string;
    constructor(public route: ActivatedRoute, public walletManager: WalletManager, public native: Native) {

    }

    ngOnInit() {
        this.init();
    }

    init() {
        this.masterWalletId = Config.getCurMasterWalletId();
        // this.route.paramMap.subscribe((params) => {
        //     this.chainId = params.get("chainId");
        //     this.createAddress();
        // });

        this.chainId = Config.coinObj.chainId;
        this.createAddress();
    }

    onChange() {
        if (!Util.number(this.amount)) {
            this.native.toast_trans('correct-amount');
        }
    }


    getAddress() {
        this.native.Go("/address", { chainId: this.chainId });
    }

    createAddress() {
        this.walletManager.createAddress(this.masterWalletId, this.chainId, (data) => {
            if (data["success"]) {
                this.qrcode = data["success"];
                this.address = data["success"];
            } else {
                alert("===createAddress===error" + JSON.stringify(data));
            }
        });
    }

}
