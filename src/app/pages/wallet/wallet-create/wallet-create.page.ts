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
    wallet = {
        name: '',
        singleAddress: false,
        payPassword: '',
        rePayPassword: ''
    };

    constructor(public route: ActivatedRoute, public native: Native, public zone: NgZone) {
        if (Config.walletObj.isMulti) {
            this.wallet.singleAddress = true;
            this.isShow = true;
        }

    }

    ngOnInit() {
    }

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
        Config.walletObj.payPassword = this.wallet.payPassword;
        Config.walletObj.name = this.wallet.name;
        Config.walletObj.singleAddress = this.wallet.singleAddress;
        console.log(Config.walletObj);
        this.native.go("/mnemonic", params);
    }
}
