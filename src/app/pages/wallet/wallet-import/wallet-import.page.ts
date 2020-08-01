import { Component, OnInit, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { Events, IonSlides } from '@ionic/angular';
import { WalletManager } from '../../../services/wallet.service';
import { Native } from '../../../services/native.service';
import { LocalStorage } from '../../../services/storage.service';
import { Util } from "../../../model/Util";
import { Config } from '../../../config/Config';
import { PopupProvider } from '../../../services/popup.service';
import { WalletCreationService } from 'src/app/services/walletcreation.service';

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
    public importFileObj: any = { payPassword: "", rePayPassword: "", backupPassWord: "", name: "" };
    public mnemonicObj: any = { mnemonic: "", payPassword: "", rePayPassword: "", phrasePassword: "", name: "", singleAddress: false };
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
            await this.importWalletWithMnemonic();
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

    async importWalletWithMnemonic() {
        this.inputStr = this.inputStr.replace(/\s+/g, "");
        await this.walletManager.importMasterWalletWithMnemonic(
            this.masterWalletId,
            this.walletCreateService.name,
            this.inputStr,
            this.walletCreateService.mnemonicPassword,
            this.walletCreateService.payPassword,
            this.walletCreateService.singleAddress
        );
        this.native.toast_trans('import-text-word-sucess');
    }

    /******************************************************
     * OLD CODE, NO LONGER USED BUT KEPT FOR REFERENCE
    ******************************************************/
  /*  public toggleShowAdvOpts(isShow): void {
        this.zone.run(() => {
            this.showAdvOpts = isShow;
        });
    }

    selectTab(tab: string) {
        this.zone.run(() => {
            this.selectedTab = tab;
        });
    }

    updateSingleAddress(isShow) {
        this.zone.run(() => {
            this.mnemonicObj.singleAddress = isShow;
        });
    }

    async onImport() {
        switch (this.selectedTab) {
            case "words":
                if (this.checkword()) {
                    await this.native.showLoading();
                    await this.importWalletWithMnemonic();
                }
                break;
            case "file":
                if (this.checkImportFile()) {
                    await this.native.showLoading();
                    await this.importWalletWithKeystore();
                }
                break;
        }
    }

   checkImportFile() {
        if (Util.isNull(this.keyStoreContent)) {
            this.native.toast_trans('import-text-keystroe-message');
            return false;
        }

        if (Util.isNull(this.importFileObj.name)) {
            this.native.toast_trans("text-wallet-name-validator");
            return false;
        }

        if (Util.isWalletName(this.importFileObj.name)) {
            this.native.toast_trans("text-wallet-name-validator1");
            return;
        }

        if (this.walletManager.walletNameExists(this.importFileObj.name)) {
            this.native.toast_trans("text-wallet-name-validator2");
            return;
        }

        if (Util.isNull(this.importFileObj.backupPassWord)) {
            this.native.toast_trans('text-backup-password-input');
            return false;
        }
        if (Util.isNull(this.importFileObj.payPassword)) {
            this.native.toast_trans('text-pay-password-input');
            return false;
        }

        if (this.importFileObj.payPassword != this.importFileObj.rePayPassword) {
            this.native.toast_trans('text-password-compare');
            return false;
        }
        return true;
    }

    checkword() {
        if (Util.isNull(this.mnemonicObj.name)) {
            this.native.toast_trans("text-wallet-name-validator");
            return false;
        }

        if (Util.isWalletName(this.mnemonicObj.name)) {
            this.native.toast_trans("text-wallet-name-validator1");
            return;
        }

        if (this.walletManager.walletNameExists(this.mnemonicObj.name)) {
            this.native.toast_trans("text-wallet-name-validator2");
            return;
        }

        if (Util.isNull(this.mnemonicObj.mnemonic)) {
            this.native.toast_trans('text-input-mnemonic');
            return false;
        }

        if (this.getMnemonicLang() === MnemonicLanguage.CHINESE_SIMPLIFIED) {
          let mnemonic = this.mnemonicObj.mnemonic.trim().replace(/ /g, '');
          if (mnemonic.length !== 12) {
              this.native.toast_trans('text-mnemonic-validator');
              return false;
          }

          // add space
          this.mnemonicObj.mnemonic = '';
          for (let i = 0; i < mnemonic.length; i++) {
            this.mnemonicObj.mnemonic += mnemonic[i] + ' '
          }
        }
        else {
          let mnemonic = this.normalizeMnemonic(this.mnemonicObj.mnemonic).replace(/^\s+|\s+$/g, "");
          if (mnemonic.split(/[\u3000\s]+/).length != 12) {
              this.native.toast_trans('text-mnemonic-validator');
              return false;
          }
        }

        if (Util.isNull(this.mnemonicObj.payPassword)) {
            this.native.toast_trans('text-pay-password-input');
            return false;
        }
        if (!Util.password(this.mnemonicObj.payPassword)) {
            this.native.toast_trans("text-pwd-validator");
            return false;
        }
        if (this.mnemonicObj.payPassword != this.mnemonicObj.rePayPassword) {
            this.native.toast_trans('text-password-compare');
            return false;
        }
        return true;
    }


    private normalizeMnemonic(words: string): string {
        if (!words || !words.indexOf) return words;
        let isJA = words.indexOf('\u3000') > -1;
        let wordList = words.split(/[\u3000\s]+/);

        return wordList.join(isJA ? '\u3000' : ' ');
    };

    getCoinListCache(createdChains) {
        let chinas = {};
        for (let index in createdChains) {
            let chain = createdChains[index];
            if (chain != "ELA") {
                chinas[chain] = chain;
            }
        }
        return chinas;
    }

    async importWalletWithMnemonic() {
        let walletName = this.getWalletName();
        let mnemonic = this.normalizeMnemonic(this.mnemonicObj.mnemonic);

        await this.walletManager.importMasterWalletWithMnemonic(this.masterWalletId, walletName, mnemonic, this.mnemonicObj.phrasePassword, this.mnemonicObj.payPassword, this.mnemonicObj.singleAddress);
        this.native.toast_trans('import-text-word-sucess');
    }

    async importWalletWithKeystore() {
        // TODO - DISABLED FOR NOW
        let walletName = this.getWalletName();

        await this.walletManager.spvBridge.importWalletWithKeystore(this.masterWalletId, this.keyStoreContent, this.importFileObj.backupPassWord, this.importFileObj.payPassword);
        this.native.toast_trans('import-text-keystroe-sucess');
    
    }

    private getWalletName(): string {
        let name = "";
        if (this.selectedTab === "words") {
            name = this.mnemonicObj.name;
        } else if (this.selectedTab === "file") {
            name = this.importFileObj.name;
        }

        return name;
    }

    getMnemonicLang(): MnemonicLanguage {
      if (Util.chinese(this.mnemonicObj.mnemonic[0])) return MnemonicLanguage.CHINESE_SIMPLIFIED;
      return MnemonicLanguage.OTHERS
    }  */
}





