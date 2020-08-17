import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { Native } from '../../../../services/native.service';
import { Util } from "../../../../model/Util";
import { ActivatedRoute } from '@angular/router';
import { Events, IonSlides, ModalController, IonInput } from '@ionic/angular';
import { WalletManager } from '../../../../services/wallet.service';
import { AuthService } from '../../../../services/auth.service';
import { WalletCreationService, SelectableMnemonic } from 'src/app/services/walletcreation.service';
import { WalletCreatedComponent } from 'src/app/components/wallet-created/wallet-created.component';
import { AppService } from 'src/app/services/app.service';
import { TranslateService } from '@ngx-translate/core';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
    selector: 'app-mnemonic-write',
    templateUrl: './mnemonic-write.page.html',
    styleUrls: ['./mnemonic-write.page.scss'],
})
export class MnemonicWritePage implements OnInit {

    @ViewChild('slider', {static: false}) slider: IonSlides;
    @ViewChild('input', {static: false}) input: IonInput;

    slideOpts = {
        initialSlide: 0,
        speed: 400,
        centeredSlides: true,
        slidesPerView: 1
    };

    public inputList: Array<any> = [];
    private inputStr: string = "";
    private mnemonicStr: string;

    private modal: any;

    constructor(
        public route: ActivatedRoute,
        public authService: AuthService,
        public native: Native,
        public events: Events,
        public walletManager: WalletManager,
        private walletCreationService: WalletCreationService,
        public zone: NgZone,
        private modalCtrl: ModalController,
        private appService: AppService,
        private translate: TranslateService
    ) {
        this.mnemonicStr = this.native.clone(this.walletCreationService.mnemonicStr);
    }

    ngOnInit() {
        for (let i = 0; i < 12; i ++) {
            this.inputList.push({
                input: ''
            });
        }
        console.log('Empty input list created', this.inputList);
    }

    ionViewWillEnter() {
        this.appService.setBackKeyVisibility(true);
        titleBarManager.setBackgroundColor('#732cd0');
        titleBarManager.setForegroundMode(TitleBarPlugin.TitleBarForegroundMode.LIGHT);
        titleBarManager.setTitle(this.translate.instant('text-mnemonic-check'));
    }

    ionViewDidEnter() {
   /*      setTimeout(() => {
            this.input.setFocus();
        }, 200); */
    }

    goToNextInput(event, nextInput?: any) {
        console.log('Input key code', event);
        if (nextInput) {
            nextInput === 'input5' || nextInput === 'input9' ? this.slider.slideNext() : () => {};
            nextInput.setFocus();
        } else {
            this.onNext();
        }
    }

    allInputsFilled() {
        let inputsFilled = true;
        this.inputList.forEach((word) => {
            if (word.input === '') {
                inputsFilled = false;
            } else {
                this.inputStr += word.input;
            }
        });
        return inputsFilled;
    }

    async onNext() {
        if (this.allInputsFilled()) {
            if (this.inputStr.replace(/\s+/g, "") === this.mnemonicStr.replace(/\s+/g, "")) {
                if (this.walletCreationService.isMulti) {
                    this.native.go("/mpublickey");
                } else {
                    this.native.toast_trans('text-mnemonic-ok');
                    await this.native.showLoading();

                    const payPassword = await this.authService.createAndSaveWalletPassword(this.walletCreationService.masterId);
                    if (payPassword) {
                        await this.walletManager.createNewMasterWallet(
                                this.walletCreationService.masterId,
                                this.walletCreationService.name,
                                this.mnemonicStr,
                                this.walletCreationService.mnemonicPassword,
                                payPassword,
                                this.walletCreationService.singleAddress
                        );

                        // this.createWalletSuccess();
                    } else {
                        // Cancelled, do nothing
                    }
                }

            } else {
                console.log('Input string ', this.inputStr);
                // console.log('Mnemonic str - ', this.mnemonicStr);
                this.inputStr = "";
                this.native.toast_trans('text-mnemonic-prompt3');
            }
        } else {
            console.log('Current progress for input string', this.inputStr);
            this.inputStr = "";
            this.native.toast(this.translate.instant("mnemonic-import-missing-words"));
        }
    }

    async createWalletSuccess() {
        this.modal = await this.modalCtrl.create({
          component: WalletCreatedComponent,
          componentProps: {
          },
        });
        this.modal.onWillDismiss().then(() => {
            this.native.go('/wallet-home');
        });
        this.modal.present();
    }
}

