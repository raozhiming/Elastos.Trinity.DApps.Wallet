import { Component, OnInit, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { WalletManager } from '../../../services/wallet.service';
import { Native } from '../../../services/native.service';
import { LocalStorage } from '../../../services/storage.service';
import { Util } from "../../../model/Util";
import { PopupProvider } from '../../../services/popup.service';
import { WalletCreationService } from 'src/app/services/walletcreation.service';
import { AuthService } from 'src/app/services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { Events } from 'src/app/services/events.service';

export enum MnemonicLanguage {
  CHINESE_SIMPLIFIED,
  OTHERS
}

@Component({
    selector: 'app-wallet-import',
    templateUrl: './wallet-import.page.html',
    styleUrls: ['./wallet-import.page.scss'],
})

export class WalletImportPage implements OnInit {

    @ViewChild('slider', {static: false}) slider: IonSlides;

    slideOpts = {
        initialSlide: 0,
        speed: 400,
        centeredSlides: true,
        slidesPerView: 1
    };

    public slideIndex = 0;

    public walletType: string;
    private masterWalletId: string = "1";

    private walletIsCreating = false; // Just in case, Ignore user action when the wallet is creating.

    public inputList: Array<{input:string}> = [];
    private inputStr: string = "";

    constructor(
        public walletManager: WalletManager,
        public native: Native,
        public localStorage: LocalStorage,
        public events: Events,
        public popupProvider: PopupProvider,
        public zone: NgZone,
        private authService: AuthService,
        private translate: TranslateService,
        private walletCreateService: WalletCreationService
    ) {
        this.masterWalletId = Util.uuid(6, 16);
    }

    ngOnInit() {
        for (let i = 0; i < 12; i ++) {
            this.inputList.push({
                input: ''
            });
        }
        console.log('Input list created', this.inputList);
    }


 /*    goToNextInput(event, nextInput?: any) {
        console.log('Input key code', event);

        // Convenient way to paste a full mnemonic (non chinese only): if only the first input has text,
        // try to split the existing input with spaces and dispatch the words into the other inputs automatically.
        let allInputFieldsWereFilled = this.tryToSplitFirstInputWords();

        if (nextInput && !allInputFieldsWereFilled) {
            nextInput === 'input5' || nextInput === 'input9' ? this.slider.slideNext() : () => {};
            nextInput.setFocus();
        } else {
            this.onImport();
        }
    } */

    slideNext(slider) {
        slider.slideNext();
    }

    goToNextInput(event, nextInput?: any, slide?: any) {
        // android: only press enter will trigger keypress event
        // ios: press any key will trigger keypress event
        if (event !== 13) {
            return;
        }

        // Convenient way to paste a full mnemonic (non chinese only): if only the first input has text,
        // try to split the existing input with spaces and dispatch the words into the other inputs automatically.
        const allInputFieldsWereFilled = this.tryToSplitFirstInputWords();

        if (nextInput && !allInputFieldsWereFilled) {
            if (slide) {
                slide.slideNext();
                setTimeout(() => {
                    nextInput.setFocus();
                }, 400);
            } else {
                nextInput.setFocus();
            }
        } else {
            this.onImport();
        }
    }

    /**
     * If only the first input has text, try to split the existing input with spaces and dispatch
     * the words into the other inputs automatically.
     * Returns true if all input box could be filled, false otherwise.
     */
    private tryToSplitFirstInputWords(): boolean {
        let firstInputContent = this.inputList[0].input;
        let firstInputWords = firstInputContent.toLowerCase().split(" ");
        if (firstInputWords.length <= 1) {
            // Just a word, we don't do anything special.
            return false;
        }

        // Dispatch all single line mnemonic input into single input fields.
        let wordCount = 0;
        for (let wordIndex in firstInputWords) {
            this.inputList[wordIndex].input = firstInputWords[wordIndex];

            // Don't try to fill more inputs than available, in case user types too many words.
            wordCount++;
            if (wordCount == 12)
                break;
        }

        if (firstInputWords.length == 12)
            return true; // All mnemonic words are entered
        else
            return false;
    }

    webKeyStore(webKeyStore) {
        console.log("========webKeyStore" + webKeyStore);
    }

    allInputsFilled() {
        let inputsFilled = true;
        // return inputsFilled; // for test
        this.inputStr = '';
        this.inputList.forEach((word) => {
            if (word.input === '') {
                inputsFilled = false;
            } else {
                this.inputStr += word.input.replace(/\s+/g, "").toLowerCase() + " "; // Append trimmed word plus a space between each word
            }
        });
        return inputsFilled;
    }

    async onImport() {
        if (this.allInputsFilled()) {
            if (this.walletIsCreating) {
                console.log('The wallet is creating, skip this action');
                return;
            }
            console.log('Input string is valid');
            this.walletIsCreating = true;
            try {
                const payPassword = await this.authService.createAndSaveWalletPassword(this.masterWalletId);
                if (payPassword) {
                    await this.native.showLoading(this.translate.instant('please-wait'));
                    await this.importWalletWithMnemonic(payPassword);
                } else {
                    // Cancelled, do nothing
                }
            } catch(err) {
                console.error('CreateWalet error:', err)
            }

            this.walletIsCreating = false;
        } else {
            this.native.toast(this.translate.instant("mnemonic-import-missing-words"));
            this.inputStr = "";
        }
    }

    async importWalletWithMnemonic(payPassword: string) {
        // Trim leading and trailing spaces for each word
        console.log('Importing with mnemonic');
        await this.walletManager.importMasterWalletWithMnemonic(
            this.masterWalletId,
            this.walletCreateService.name,
            this.inputStr.toLowerCase(),
            this.walletCreateService.mnemonicPassword,
            payPassword,
            this.walletCreateService.singleAddress
        );

        this.events.publish("masterwalletcount:changed", {
            action: 'add',
            walletId: this.masterWalletId
        });

        this.native.toast_trans('import-text-word-sucess');
    }

    goToAdvancedImport() {
        this.native.go('wallet-advanced-import');
    }

    ionSlideDidChange() {
        this.zone.run(async () => {
            this.slideIndex = await this.slider.getActiveIndex();
        });
    }
}
