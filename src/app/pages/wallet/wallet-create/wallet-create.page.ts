import { Component, OnInit, NgZone } from '@angular/core';
import { Util } from "../../../model/Util";
import { Native } from '../../../services/native.service';
import { Config } from '../../../config/Config';
import { ActivatedRoute } from '@angular/router';
import { WalletManager } from 'src/app/services/wallet.service';

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

    constructor(public route: ActivatedRoute, 
        public native: Native,
        private walletManager: WalletManager, 
        public zone: NgZone) {
        if (this.walletManager.walletObj.isMulti) {
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

        if (this.walletManager.walletNameExists(this.wallet.name)) {
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
        this.walletManager.walletObj.payPassword = this.wallet.payPassword;
        this.walletManager.walletObj.name = this.wallet.name;
        this.walletManager.walletObj.singleAddress = this.wallet.singleAddress;

        this.native.go("/mnemonic-create", params);
    }
}
