import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavParams, IonInput } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { Config } from '../../services/Config';
import { Native } from '../../services/Native';
import { PopupProvider} from '../../services/popup';

@Component({
    selector: 'app-paymentbox',
    templateUrl: './paymentbox.component.html',
    styleUrls: ['./paymentbox.component.scss'],
})
export class PaymentboxComponent implements OnInit {
    @ViewChild('pwd') pwd: IonInput;

    public SELA = Config.SELA;
    public toAddress = '';
    public walltype = false;
    public transfer: any = {
        toAddress: '',
        amount: '',
        memo: '',
        fee: 0,
        payPassword: '',
        rate: ''
    };

    private walletId = '';
    public useFingerprintAuthentication = false;
    public fingerprintPluginAuthenticationOnGoing = false;
    public fingerprintAuthenticationIsAvailable = false;

    constructor(public route: ActivatedRoute,
                public modalCtrl: ModalController,
                public navParams: NavParams,
                private authService: AuthService,
                public popupProvider: PopupProvider,
                public native: Native) {
        this.walletId = Config.getCurMasterWalletId();
        const accountObj = Config.getAccountType(this.walletId);
        if (accountObj["Type"] === "Multi-Sign" && accountObj["InnerType"] === "Readonly") {
            this.walltype = false;
        } else {
            this.walltype = true;
        }

        this.transfer = this.navParams.data;
        if (this.transfer["rate"]) {
            this.toAddress = this.transfer["accounts"];
        } else {
            this.toAddress = this.transfer["toAddress"] ? this.transfer["toAddress"] : '';
        }
    }

    ngOnInit() {
    }

    async ionViewWillEnter() {
        this.transfer.payPassword = '';
        this.fingerprintAuthenticationIsAvailable = await this.authService.fingerprintIsAvailable();
        if (this.fingerprintAuthenticationIsAvailable) {
            this.useFingerprintAuthentication = await this.authService.fingerprintAuthenticationEnabled(this.walletId);
        } else {
            this.useFingerprintAuthentication = false;
        }
    }

    ionViewDidEnter() {
        if (this.pwd) {
            this.pwd.setFocus();
        }
    }

    click_close() {
        this.modalCtrl.dismiss(null);
    }

    click_button() {
        if (!this.walltype) {
            this.modalCtrl.dismiss(this.transfer);
            return;
        }
        if (this.transfer.payPassword) {
            this.modalCtrl.dismiss(this.transfer.payPassword);
        } else {
            this.native.toast_trans('text-pay-password-input');
        }
    }

    promptFingerprintActivation() {
        this.popupProvider.ionicConfirm('confirmTitle', 'activate-fingerprint-popup-content').then(async (data) => {
            if (data) {
                this.fingerprintPluginAuthenticationOnGoing = true;

                // User agreed to activate fingerprint authentication. We ask the auth service to
                // save the typed password securely using the fingerprint.
                const couldActivate = await this.authService.activateFingerprintAuthentication(this.walletId, this.transfer.payPassword);
                this.useFingerprintAuthentication = couldActivate;
                if (couldActivate) {
                    this.fingerprintPluginAuthenticationOnGoing = false;
                    this.click_button();
                } else {
                    // Failed to activate
                }
            }
        });
    }

    async promptFingerprintAuthentication() {
        this.fingerprintPluginAuthenticationOnGoing = true;
        this.transfer.payPassword = await this.authService.authenticateByFingerprintAndGetPassword(this.walletId);
        if (this.transfer.payPassword) {
            this.click_button();
        } else {
            this.fingerprintPluginAuthenticationOnGoing = false;
        }
    }

    async disableFingerprintAuthentication() {
        this.useFingerprintAuthentication = false;
        await this.authService.deactivateFingerprintAuthentication(this.walletId);
    }

    canPromptFingerprint() {
        return (this.transfer.payPassword !== '') && this.fingerprintAuthenticationIsAvailable;
    }
}
