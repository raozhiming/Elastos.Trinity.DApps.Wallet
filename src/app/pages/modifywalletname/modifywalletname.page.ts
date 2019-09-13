import { Component, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';
import { Util } from '../../services/Util';
import { Config } from '../../services/Config';
import { Native } from '../../services/Native';
import { LocalStorage } from '../../services/Localstorage';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-modifywalletname',
    templateUrl: './modifywalletname.page.html',
    styleUrls: ['./modifywalletname.page.scss'],
})
export class ModifywalletnamePage implements OnInit {
    public walletname: string = "";
    public masterWalletId: string = "1";
    constructor(public route: ActivatedRoute, public native: Native, public localStorage: LocalStorage, public events: Events) {
        this.masterWalletId = Config.modifyId
        this.walletname = Config.masterManager.masterWallet[this.masterWalletId].name;
    }

    ngOnInit() {
        console.log('ngOnInit ModifywalletnamePage');
    }

    modify() {
        if (Util.isNull(this.walletname)) {
            this.native.toast_trans("text-wallet-name-validator");
            return;
        }

        if (Util.isWalletName(this.walletname)) {
            this.native.toast_trans("text-wallet-name-validator1");
            return;
        }

        if (Util.isWallNameExit(this.walletname)) {
            this.native.toast_trans("text-wallet-name-validator2");
            return;
        }

        // this.native.showLoading().then(() => {
            this.modifyName();
        // })


    }

    modifyName() {
        Config.masterManager.masterWallet[this.masterWalletId].name = this.walletname;
        Config.masterManager.saveInfos();
        this.native.pop();
    }
}
