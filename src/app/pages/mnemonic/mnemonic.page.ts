import { Component, OnInit } from '@angular/core';
import { NavParams, Events } from '@ionic/angular';
import { Native } from '../../services/Native';
import { WalletManager } from '../../services/WalletManager';
import { Config } from '../../services/Config';
import { Util } from '../../services/Util';
import { LocalStorage } from '../../services/Localstorage';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-mnemonic',
    templateUrl: './mnemonic.page.html',
    styleUrls: ['./mnemonic.page.scss'],
})
export class MnemonicPage implements OnInit {
    masterWalletId: string = "1";
    mnemonicList = [];
    mnemonicStr: string;
    mnemonicPassword: string = "";
    mnemonicRepassword: string = "";
    payPassword: string;
    name: string;
    singleAddress: boolean = false;
    defaultCointype = "Ela";
    isSelect: boolean = false;

    constructor(public route: ActivatedRoute,
        public walletManager: WalletManager, public native: Native, public localStorage: LocalStorage, public events: Events) {
        native.showLoading().then(() => {
            this.init();
        })
    }

    ngOnInit() {
    }

    init() {
        this.name = Config.walletObj.name;
        this.singleAddress = Config.walletObj.singleAddress;
        this.payPassword = Config.walletObj.payPassword;

        this.masterWalletId = Config.uuid(6, 16);
        this.walletManager.generateMnemonic(this.native.getMnemonicLang(), (ret) => {
            this.native.hideLoading();
            this.mnemonicStr = ret;
            let mnemonicArr = this.mnemonicStr.split(/[\u3000\s]+/);
            for (var i = 0; i < mnemonicArr.length; i++) {
                this.mnemonicList.push({ text: mnemonicArr[i], selected: false });
            }

        });

    }

    onNext() {
        if (!Util.password(this.mnemonicPassword) && this.isSelect) {
            this.native.toast_trans("text-pwd-validator");
            return;
        }

        if (this.mnemonicPassword != this.mnemonicRepassword && this.isSelect) {
            this.native.toast_trans("text-repwd-validator");
            return;
        }

        if (!this.isSelect) {
            this.mnemonicPassword = "";
            this.mnemonicRepassword = "";
        }

        if (Config.walletObj.isMulti) {
            this.goMnemonicWrite();
            return;
        }

        this.native.showLoading().then(() => {
            this.walletManager.createMasterWallet(this.masterWalletId, this.mnemonicStr, this.mnemonicPassword, this.payPassword, this.singleAddress, () => {
                this.createSubWallet('ELA');
            });
        });

    }

    createSubWallet(chainId) {
        // Sub Wallet
        this.walletManager.createSubWallet(this.masterWalletId, chainId, 0, () => {
            let walletObj = this.native.clone(Config.masterWallObj);
            walletObj["id"] = this.masterWalletId;
            walletObj["wallname"] = this.name;
            walletObj["Account"] = { "SingleAddress": this.singleAddress, "Type": "Standard" };
            this.localStorage.saveMappingTable(walletObj).then(() => {
                let mappingList = this.native.clone(Config.getMappingList());
                mappingList[this.masterWalletId] = walletObj;
                this.native.info(mappingList);
                Config.setMappingList(mappingList);
                this.saveWalletList();
                this.registerWalletListener(this.masterWalletId, chainId);

            });
        });
    }

    saveWalletList() {
        Config.getMasterWalletIdList().push(this.masterWalletId);
        this.localStorage.saveCurMasterId({ masterId: this.masterWalletId }).then((data) => {
            this.native.hideLoading();
            Config.setCurMasterWalletId(this.masterWalletId);
            this.goMnemonicWrite();
        });
    }

    registerWalletListener(masterId, coin) {
        this.walletManager.registerWalletListener(masterId, coin, (data) => {
            if (!Config.isResregister(masterId, coin)) {
                Config.setResregister(masterId, coin, true);
            }
            this.events.publish("register:update", masterId, coin, data);
        });
    }

    onChangeSelect(select) {
        this.isSelect = select;
    }

    goMnemonicWrite() {
        Config.walletObj.mnemonicStr = this.mnemonicStr;
        Config.walletObj.mnemonicList = this.mnemonicList;
        Config.walletObj.mnemonicPassword = this.mnemonicPassword;
        console.log(Config.walletObj);
        this.native.go("/mnemonic-write");
    }
}

