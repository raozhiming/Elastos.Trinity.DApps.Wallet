import { Component, OnInit, NgZone } from '@angular/core';
import { NavParams, Events } from '@ionic/angular';
import { Native } from '../../../../services/native.service';
import { WalletManager } from '../../../../services/wallet.service';
import { Config } from '../../../../config/Config';
import { Util } from '../../../../model/Util';
import { LocalStorage } from '../../../../services/storage.service';
import { ActivatedRoute } from '@angular/router';

type SelectableMnemonic = {
    text: string;
    selected: boolean;
}

@Component({
    selector: 'app-mnemonic-create',
    templateUrl: './mnemonic-create.page.html',
    styleUrls: ['./mnemonic-create.page.scss'],
})
export class MnemonicCreatePage implements OnInit {
    masterWalletId: string = "1";
    mnemonicList: SelectableMnemonic[] = [];
    mnemonicStr: string;
    mnemonicPassword: string = "";
    mnemonicRepassword: string = "";
    defaultCointype = "Ela";
    isSelect: boolean = false;

    constructor(public route: ActivatedRoute,
        public walletManager: WalletManager, public native: Native, public localStorage: LocalStorage, public events: Events,
        public zone: NgZone) {
        native.showLoading().then(() => {
            this.init();
        })
    }

    ngOnInit() {
    }

    async init() {
        this.masterWalletId = Config.uuid(6, 16);
        let ret = await this.walletManager.generateMnemonic(this.native.getMnemonicLang());
        this.native.hideLoading();
        this.mnemonicStr = ret;
        let mnemonicArr = this.mnemonicStr.split(/[\u3000\s]+/);
        this.zone.run(()=>{
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

        this.goMnemonicWrite();
    }

    onChangeSelect(select) {
        this.isSelect = select;
    }

    goMnemonicWrite() {
        Config.walletObj.masterId = this.masterWalletId;
        Config.walletObj.mnemonicStr = this.mnemonicStr;
        Config.walletObj.mnemonicList = this.mnemonicList;
        Config.walletObj.mnemonicPassword = this.mnemonicPassword;
        // console.log(Config.walletObj);
        this.native.go("/mnemonic-write");
    }
}

