import { Component, OnInit } from '@angular/core';
import { Native } from '../../services/Native';
import { Config } from '../../services/Config';
import { WalletManager } from '../../services/WalletManager';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-mpublickey',
    templateUrl: './mpublickey.page.html',
    styleUrls: ['./mpublickey.page.scss'],
})
export class MpublickeyPage implements OnInit {
    public masterWalletId: string = "1";
    public qrcode: string = null;
    exatParm: any;
    walletObj: any;
    constructor(public route: ActivatedRoute, public native: Native, public walletManager: WalletManager) {
        if (Config.walletObj.isMulti) {
            this.getPublicKey();
        } else if (this.exatParm["importText"]) {
            // this.getMultiSignPubKeyWithPrivKey();
        }
    }

    ngOnInit() {
    }

    copy() {
        this.native.copyClipboard(this.qrcode);
        this.native.toast_trans('copy-ok');
    }

    getPublicKey() {
        // this.walletManager.getMultiSignPubKeyWithMnemonic(Config.walletObj.mnemonicStr,
        //     Config.walletObj.mnemonicPassword, (ret) => this.qrcode = ret);
    }

    getMultiSignPubKeyWithPrivKey() {
        // this.walletManager.getMultiSignPubKeyWithPrivKey(this.exatParm["importText"],
        //     (ret) => this.qrcode = ret);
    }

    onNext() {
        if (Config.walletObj.isMulti) {
            this.native.go("/addpublickey", this.exatParm);
        } else if (this.exatParm["importText"]) {
            this.native.go("/addprivatekey", this.exatParm);
        }

    }
}


