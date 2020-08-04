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

    masterWalletId: string = "1";
    public selectedTab: string = "words";
    public showAdvOpts: boolean;
    public keyStoreContent: any;
    public mnemonicObj: any = { mnemonic: "", phrasePassword: "", name: "", singleAddress: false };
    public walletType: string;

    public word1 = "";
    public word2 = "";
    public word3 = "";
    public word4 = "";
    public word5 = "";
    public word6 = "";
    public word7 = "";
    public word8 = "";
    public word9 = "";
    public word10 = "";
    public word11 = "";
    public word12 = "";

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

    ngOnInit() {}

    ngOnDestroy() {
        this.events.unsubscribe("error:update");
    }

    // For testing purposes
    inputChanged(event) {
        console.log('Input test', event);
    }

    webKeyStore(webKeyStore) {
        console.log("========webKeyStore" + webKeyStore);
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
            this.inputStr = "";
        }
    }

    allInputsFilled() {
        if (this.word1 === '') {
            return false;
        } else {
            this.inputStr += this.word1;
        }
        if (this.word2 === '') {
            return false;
        } else {
            this.inputStr += this.word2;
        }
        if (this.word3 === '') {
            return false;
        } else {
            this.inputStr += this.word3;
        }
        if (this.word4 === '') {
            return false;
        } else {
            this.inputStr += this.word4;
        }
        if (this.word5 === '') {
            return false;
        } else {
            this.inputStr += this.word5;
        }
        if (this.word6 === '') {
            return false;
        } else {
            this.inputStr += this.word6;
        }
        if (this.word7 === '') {
            return false;
        } else {
            this.inputStr += this.word7;
        }
        if (this.word8 === '') {
            return false;
        } else {
            this.inputStr += this.word8;
        }
        if (this.word9 === '') {
            return false;
        } else {
            this.inputStr += this.word9;
        }
        if (this.word10 === '') {
            return false;
        } else {
            this.inputStr += this.word10;
        }
        if (this.word11 === '') {
            return false;
        } else {
            this.inputStr += this.word11;
        }
        if (this.word12 === '') {
            return false;
        } else {
            this.inputStr += this.word12;
        }
        return true;
    }

    async importWalletWithMnemonic(payPassword: string) {
        this.inputStr = this.inputStr.replace(/\s+/g, "");
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





