import { Component, OnInit, NgZone } from '@angular/core';
import { Util } from "../../../model/Util";
import { Native } from '../../../services/native.service';
import { Config } from '../../../config/Config';
import { ActivatedRoute } from '@angular/router';
import { WalletManager } from 'src/app/services/wallet.service';
import { WalletCreationService, NewWallet } from 'src/app/services/walletcreation.service';
import { AppService } from 'src/app/services/app.service';
import { TranslateService } from '@ngx-translate/core';
import { UiService } from 'src/app/services/ui.service';

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
        mnemonicPassword: ''
    };
    public repeatMnemonicPassword: '';

    public helpMessage = 'help:mnemonic-password';

    constructor(
        public route: ActivatedRoute,
        public native: Native,
        private walletManager: WalletManager,
        public walletCreationService: WalletCreationService,
        public zone: NgZone,
        private appService: AppService,
        public translate: TranslateService,
        public uiService: UiService
    ) {
        if (this.walletCreationService.isMulti) {
            this.wallet.singleAddress = true;
        }
    }

    ngOnInit() {
    }

    ionViewWillEnter() {
        titleBarManager.setBackgroundColor('#732cd0');
        this.appService.setBackKeyVisibility(true);
        if (this.walletCreationService.type === 1) {
            titleBarManager.setTitle(this.translate.instant('launcher-create-wallet'));
        } else {
            titleBarManager.setTitle(this.translate.instant('launcher-backup-import'));
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
            this.native.toast_trans("text-wallet-name-validator-enter-name");
            return;
        }
        if (Util.isWalletName(this.wallet.name)) {
            this.native.toast_trans("text-wallet-name-validator-not-valid-name");
            return;
        }
        if (this.walletManager.walletNameExists(this.wallet.name)) {
            this.native.toast_trans("text-wallet-name-validator-already-exists");
            return;
        }
        if (
            this.walletCreationService.type === NewWallet.CREATE &&
            this.wallet.mnemonicPassword &&
            this.wallet.mnemonicPassword !== this.repeatMnemonicPassword
        ) {
            this.native.toast_trans("text-repwd-validator");
            return;
        }
        this.createWallet();
    }

    createWallet() {
        this.walletCreationService.name = this.wallet.name;
        this.walletCreationService.singleAddress = this.wallet.singleAddress;
        this.walletCreationService.mnemonicPassword = this.wallet.mnemonicPassword;

        if (this.walletCreationService.type === 1) {
            this.native.go("/mnemonic-create");
        } else {
            this.native.go("/wallet-import");
        }
    }

    goToNextInput(event, nextInput: any) {
        console.log('Input key code', event);
        nextInput.setFocus();
    }
}
