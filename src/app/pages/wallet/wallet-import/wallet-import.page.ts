import { Component, OnInit, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { Events, IonSlides } from '@ionic/angular';
import { WalletManager } from '../../../services/wallet.service';
import { Native } from '../../../services/native.service';
import { LocalStorage } from '../../../services/storage.service';
import { Util } from "../../../model/Util";
import { Config } from '../../../config/Config';
import { PopupProvider } from '../../../services/popup.service';
import { WalletCreationService } from 'src/app/services/walletcreation.service';
import { AuthService } from 'src/app/services/auth.service';

export enum MnemonicLanguage {
  CHINESE_SIMPLIFIED,
  OTHERS
}

@Component({
    selector: 'app-wallet-import',
    templateUrl: './wallet-import.page.html',
    styleUrls: ['./wallet-import.page.scss'],
})

export class WalletImportPage implements OnInit, OnDestroy {

    @ViewChild('slider', {static: false}) slider: IonSlides;

    slideOpts = {
        initialSlide: 0,
        speed: 400,
        centeredSlides: true,
        slidesPerView: 1
    };

    public walletType: string;
    private masterWalletId: string = "1";

    public inputList: Array<any> = [];
    private inputStr: string = "";

    constructor(
        public walletManager: WalletManager,
        public native: Native,
        public localStorage: LocalStorage,
        public events: Events,
        public popupProvider: PopupProvider,
        public zone: NgZone,
        private authService: AuthService,
        private walletCreateService: WalletCreationService
    ) {
        this.masterWalletId = Util.uuid(6, 16);
        this.events.subscribe("error:update", (item) => {
            if (item && item["error"]) {
                if (item["error"]["code"] === 20036) {
                    this.popupProvider.webKeyPrompt().then((val) => {
                        console.log("========webKeyStore" + val);
                        if (val === null) {
                            return;
                        }
                        this.webKeyStore(val.toString());
                    });
                }
            }
        });
    }

    ngOnInit() {
        for (let i = 0; i < 12; i ++) {
            this.inputList.push({
                input: ''
            });
        }
        console.log('Input list created', this.inputList);
    }

    ngOnDestroy() {
        this.events.unsubscribe("error:update");
    }

    // For testing purposes
    inputChanged(event) {
    }

    webKeyStore(webKeyStore) {
        console.log("========webKeyStore" + webKeyStore);
    }

    allInputsFilled() {
        let inputsFilled = true;

        this.inputList.forEach((word) => {
            if (word.input === '') {
                inputsFilled = false;
            } else {
                this.inputStr += word.input.replace(/\s+/g, "") + " "; // Append trimmed word plus a space between each word
            }
        });
        return inputsFilled;
    }

    async onImport() {
        if (this.allInputsFilled()) {
            await this.native.showLoading();

            let payPassword = await this.authService.createAndSaveWalletPassword(this.masterWalletId);
            if (payPassword) {
                await this.importWalletWithMnemonic(payPassword);
            }
            else {
                // Cancelled, do nothing
            }
        } else {
            this.native.toast('Please fill in all inputs');
            this.inputStr = "";
        }
    }

    async importWalletWithMnemonic(payPassword: string) {
        // Trim leading and trailing spaces for each word
        console.log('Importing with mnemonic');
        await this.walletManager.importMasterWalletWithMnemonic(
            this.masterWalletId,
            this.walletCreateService.name,
            this.inputStr,
            this.walletCreateService.mnemonicPassword,
            payPassword,
            this.walletCreateService.singleAddress
        );
        this.native.toast_trans('import-text-word-sucess');
    }
}





