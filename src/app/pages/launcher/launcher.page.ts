import { Component, OnInit } from '@angular/core';
import { Native } from '../../services/native.service';
import { WalletManager, WalletObjTEMP } from 'src/app/services/wallet.service';

declare let appManager: AppManagerPlugin.AppManager;

@Component({
    selector: 'app-launcher',
    templateUrl: './launcher.page.html',
    styleUrls: ['./launcher.page.scss'],
})
export class LauncherPage implements OnInit {

    constructor(public native: Native, private walletManager: WalletManager) {
    }

    ngOnInit() {
    }

    ionViewDidEnter() {
        appManager.setVisible("show", ()=>{}, (err)=>{});
    }

    onNext(type) {
        this.walletManager.walletObj = new WalletObjTEMP();
        this.walletManager.walletObj.isMulti = false;

        switch (type) {
            case 1:
                this.native.go("/wallet-create");
                break;
            case 2:
                this.native.go("/wallet-import");
                break;
            case 3:
                this.walletManager.walletObj.isMulti = true;
                this.native.go("/createmultiwallet");
                break;
        }
    }
}
