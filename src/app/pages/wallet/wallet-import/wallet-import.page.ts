import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { Events } from '@ionic/angular';
import { WalletManager } from '../../../services/WalletManager';
import { Native } from '../../../services/Native';
import { LocalStorage } from '../../../services/Localstorage';
import { Util } from "../../../services/Util";
import { Config } from '../../../services/Config';
import { PopupProvider } from '../../../services/popup';

@Component({
    selector: 'app-wallet-import',
    templateUrl: './wallet-import.page.html',
    styleUrls: ['./wallet-import.page.scss'],
})
export class WalletImportPage implements OnInit, OnDestroy {

    masterWalletId: string = "1";
    public selectedTab: string = "words";
    public showAdvOpts: boolean;
    public keyStoreContent: any;
    public importFileObj: any = { payPassword: "", rePayPassword: "", backupPassWord: "", name: "" };
    public mnemonicObj: any = { mnemonic: "", payPassword: "", rePayPassword: "", phrasePassword: "", name: "", singleAddress: false };
    public walletType: string;
    public accontObj: any = {};
    constructor(public walletManager: WalletManager, public native: Native, public localStorage: LocalStorage, public events: Events, public popupProvider: PopupProvider, public zone: NgZone) {
        this.masterWalletId = Config.uuid(6, 16);
        this.events.subscribe("error:update", (item) => {
            if (item["error"]) {
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
    public toggleShowAdvOpts(isShow): void {
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


    onImport() {
        //this.native.showLoading();
        switch (this.selectedTab) {
            case "words":
                if (this.checkword()) {
                    this.native.showLoading().then(() => {
                        this.importWalletWithMnemonic();
                    });
                }
                break;
            case "file":
                if (this.checkImportFile()) {
                    this.native.showLoading().then(() => {
                        this.importWalletWithKeystore();
                    });
                }
                break;
        }
    }

    checkImportFile() {

        if (Util.isNull(this.keyStoreContent)) {
            //this.native.hideLoading();
            this.native.toast_trans('import-text-keystroe-message');
            return false;
        }

        if (Util.isNull(this.importFileObj.name)) {
            //this.native.hideLoading();
            this.native.toast_trans("text-wallet-name-validator");
            return false;
        }

        if (Util.isWalletName(this.importFileObj.name)) {
            this.native.toast_trans("text-wallet-name-validator1");
            return;
        }

        if (Util.isWallNameExit(this.importFileObj.name)) {
            this.native.toast_trans("text-wallet-name-validator2");
            return;
        }


        if (Util.isNull(this.importFileObj.backupPassWord)) {
            //this.native.hideLoading();
            this.native.toast_trans('text-backup-password-input');
            return false;
        }
        if (Util.isNull(this.importFileObj.payPassword)) {
            //this.native.hideLoading();
            this.native.toast_trans('text-pay-password-input');
            return false;
        }

        if (this.importFileObj.payPassword != this.importFileObj.rePayPassword) {
            //this.native.hideLoading();
            this.native.toast_trans('text-password-compare');
            return false;
        }
        return true;
    }

    importWalletWithKeystore() {
        this.walletManager.importWalletWithKeystore(this.masterWalletId,
            this.keyStoreContent, this.importFileObj.backupPassWord,
            this.importFileObj.payPassword, () => {
                this.createSubWallet('import-text-keystroe-sucess');
            });
    }

    async createSubWallet(msg) {
        this.walletManager.createSubWallet(this.masterWalletId, "ELA", () => {
            // open IDChain for did
            this.walletManager.createSubWallet(this.masterWalletId, "IDChain", () => {
                this.native.toast_trans(msg);
                this.saveWalletList();
            });
        });
    }

    checkword() {
        if (Util.isNull(this.mnemonicObj.name)) {
            //this.native.hideLoading();
            this.native.toast_trans("text-wallet-name-validator");
            return false;
        }

        if (Util.isWalletName(this.mnemonicObj.name)) {
            this.native.toast_trans("text-wallet-name-validator1");
            return;
        }

        if (Util.isWallNameExit(this.mnemonicObj.name)) {
            this.native.toast_trans("text-wallet-name-validator2");
            return;
        }


        if (Util.isNull(this.mnemonicObj.mnemonic)) {
            //this.native.hideLoading();
            this.native.toast_trans('text-input-mnemonic');
            return false;
        }

        let mnemonic = this.normalizeMnemonic(this.mnemonicObj.mnemonic).replace(/^\s+|\s+$/g, "");
        if (mnemonic.split(/[\u3000\s]+/).length != 12) {
            //this.native.hideLoading();
            this.native.toast_trans('text-mnemonic-validator');
            return false;
        }

        if (Util.isNull(this.mnemonicObj.payPassword)) {
            //this.native.hideLoading();
            this.native.toast_trans('text-pay-password');
            return false;
        }
        if (!Util.password(this.mnemonicObj.payPassword)) {
            //this.native.hideLoading();
            this.native.toast_trans("text-pwd-validator");
            return false;
        }
        if (this.mnemonicObj.payPassword != this.mnemonicObj.rePayPassword) {
            //this.native.hideLoading();
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

    importWalletWithMnemonic() {
        let mnemonic = this.normalizeMnemonic(this.mnemonicObj.mnemonic);
        this.walletManager.importWalletWithMnemonic(this.masterWalletId, mnemonic, this.mnemonicObj.phrasePassword, this.mnemonicObj.payPassword, this.mnemonicObj.singleAddress, (data) => {
            this.createSubWallet('import-text-word-sucess');
        });
    }

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

    saveWalletList() {
        let name = "";
        if (this.selectedTab === "words") {
            name = this.mnemonicObj.name;
            this.accontObj["singleAddress"] = this.mnemonicObj.singleAddress;
        } else if (this.selectedTab === "file") {
            name = this.importFileObj.name;
        }

        Config.masterManager.addMasterWallet(this.masterWalletId, name, this.accontObj);

    }

    ngOnDestroy() {
        this.events.unsubscribe("error:update");
    }

    webKeyStore(webKeyStore) {
        console.log("========webKeyStore" + webKeyStore);
        // this.native.showLoading().then(() => {
        //     this.walletManager.importWalletWithOldKeystore(this.masterWalletId,
        //         this.keyStoreContent, this.importFileObj.backupPassWord,
        //         this.importFileObj.payPassword, webKeyStore, () => {
        //             this.createSubWallet('import-text-word-sucess');
        //         });
        // });
    }

    ngOnInit() {
    }

}





