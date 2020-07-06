import { Component, OnInit } from '@angular/core';
import { Native } from '../../../services/native.service';
import { Config } from '../../../config/Config';
import { Util } from '../../../model/Util';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-wallet-create-name',
    templateUrl: './wallet-create-name.page.html',
    styleUrls: ['./wallet-create-name.page.scss'],
})
export class WalletCreateNamePage implements OnInit {
    public name: string = "";
    constructor(public route: ActivatedRoute, public native: Native) {

    }

    ngOnInit() {
        console.log('ngOnInit WalletCreateNamePage');
    }

    import() {
        if (this.checkParms()) {
            Config.walletObj.name = this.name;
            this.native.go("/addpublickey");
        }
    }

    checkParms() {
        if (Util.isNull(this.name)) {
            this.native.toast_trans("text-wallet-name-validator");
            return false;
        }

        if (Util.isWalletName(this.name)) {
            this.native.toast_trans("text-wallet-name-validator1");
            return;
        }

        if (Util.isWallNameExit(this.name)) {
            this.native.toast_trans("text-wallet-name-validator2");
            return;
        }

        return true;
    }

}
