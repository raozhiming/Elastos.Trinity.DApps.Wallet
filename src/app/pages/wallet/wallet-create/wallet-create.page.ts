import { Component, OnInit, NgZone } from '@angular/core';
import { Util } from "../../../model/Util";
import { Native } from '../../../services/native.service';
import { Config } from '../../../config/Config';
import { ActivatedRoute } from '@angular/router';
import { WalletManager } from 'src/app/services/wallet.service';
import { WalletCreationService } from 'src/app/services/walletcreation.service';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
    selector: 'app-wallet-create',
    templateUrl: './wallet-create.page.html',
    styleUrls: ['./wallet-create.page.scss'],
})
export class WalletCreatePage implements OnInit {

    public showOptions: boolean = false;
    public wallet = {
        name: '',
        singleAddress: false,
        payPassword: '',
        rePayPassword: '',
        mnemonicPassword: ''
    };

    constructor(
        public route: ActivatedRoute,
        public native: Native,
        private walletManager: WalletManager,
        public walletCreationService: WalletCreationService,
        public zone: NgZone
    ) {
        if (this.walletCreationService.isMulti) {
            this.wallet.singleAddress = true;
        }
    }

    ngOnInit() {
    }

    ionViewWillEnter() {
        titleBarManager.setBackgroundColor('#732cd0');
        if (this.walletCreationService.type === 1) {
            titleBarManager.setTitle('Create Wallet');
        } else {
            titleBarManager.setTitle('Import Wallet');
        }
    }

    ionViewDidEnter() {
    }

    updateSingleAddress(event) {
        // this.wallet.singleAddress = event.detail.checked;
        console.log('Single address toggled?', + this.wallet.singleAddress, event);
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
        if (this.wallet.payPassword !== this.wallet.rePayPassword) {
            this.native.toast_trans("text-repwd-validator");
            return;
        }
        this.createWallet();
    }

    createWallet() {
        this.walletCreationService.payPassword = this.wallet.payPassword;
        this.walletCreationService.name = this.wallet.name;
        this.walletCreationService.singleAddress = this.wallet.singleAddress;
        this.walletCreationService.mnemonicPassword = this.wallet.mnemonicPassword;

        if (this.walletCreationService.type === 1) {
            this.native.go("/mnemonic-create");
        } else {
            this.native.go("/wallet-import");
        }
    }
}
