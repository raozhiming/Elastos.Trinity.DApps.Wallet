import { Component, OnInit, NgZone } from '@angular/core';
import { Util } from '../../services/Util';
import { Native } from '../../services/Native';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-importmnemonic',
    templateUrl: './importmnemonic.page.html',
    styleUrls: ['./importmnemonic.page.scss'],
})
export class ImportmnemonicPage implements OnInit {

    public showAdvOpts: boolean;
    public mnemonicObj: any = { mnemonic: "", payPassword: "", rePayPassword: "", phrasePassword: "", name: "", singleAddress: true };
    public exatParm: any;
    constructor(public route: ActivatedRoute, public native: Native, public zone: NgZone) {
        this.route.queryParams.subscribe((data) => {
            this.exatParm = data;
        });
    }

    ngOnInit() {
    }

    checkWorld() {
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
            this.native.toast_trans('text-passworld-compare');
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

    onNext() {
        if (this.checkWorld()) {

            this.exatParm["mnemonicStr"] = this.normalizeMnemonic(this.mnemonicObj.mnemonic);
            this.exatParm["mnemonicPassword"] = this.mnemonicObj.phrasePassword;
            this.exatParm["payPassword"] = this.mnemonicObj.payPassword;
            this.exatParm["name"] = this.mnemonicObj.name;
            this.native.go("/mpublickey", this.exatParm);
        }
    }

    updateSingleAddress(isShow) {
        this.zone.run(() => {
            this.mnemonicObj.singleAddress = isShow;
        });
    }

    public toggleShowAdvOpts(isShow): void {
        this.zone.run(() => {
            this.showAdvOpts = isShow;
        });
    }
}

