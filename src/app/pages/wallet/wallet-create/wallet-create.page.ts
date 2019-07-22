import { Component, OnInit, NgZone } from '@angular/core';
import { Util } from "../../../services/Util";
import { Native } from '../../../services/Native';
import { Config } from '../../../services/Config';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-wallet-create',
    templateUrl: './wallet-create.page.html',
    styleUrls: ['./wallet-create.page.scss'],
})
export class WalletCreatePage implements OnInit {
    MultObj: any;
    isShow: any = false;
    constructor(public route: ActivatedRoute, public native: Native, public zone: NgZone) {
        this.route.queryParams.subscribe((data) => {
            this.MultObj = data;
            console.log(this.MultObj);
            this.native.info(this.MultObj);
            if (!Util.isEmptyObject(this.MultObj)) {
                this.wallet.singleAddress = true;
                this.isShow = true;
            }
        });

    }

    ngOnInit() {
    }


    wallet = {
        name: 'kuit',
        singleAddress: false,
        payPassword: 'password',//houpeitest
        rePayPassword: 'password'//houpeitest
    };

    updateSingleAddress(isShow) {
        this.zone.run(() => {
            this.wallet.singleAddress = isShow;
        });
    }


    onCreate() {

        if (Util.isNull(this.wallet.name)) {
            this.native.toast_trans("text-wallet-name-validator");
            return;
        }

        if (Util.isWalletName(this.wallet.name)) {
            this.native.toast_trans("text-wallet-name-validator1");
            return;
        }

        if (Util.isWallNameExit(this.wallet.name)) {
            this.native.toast_trans("text-wallet-name-validator2");
            return;
        }

        if (!Util.password(this.wallet.payPassword)) {
            this.native.toast_trans("text-pwd-validator");
            return;
        }
        if (this.wallet.payPassword != this.wallet.rePayPassword) {
            this.native.toast_trans("text-repwd-validator");
            return;
        }
        this.createWallet();
    }

    createWallet() {
        // Master Wallet
        var params = {
            payPassword: this.wallet.payPassword, name: this.wallet.name,
            singleAddress: this.wallet.singleAddress, mult: JSON.stringify(this.MultObj)
        };
        this.native.Go("/mnemonic", params);
    }
}
