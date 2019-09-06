import { Component, OnInit } from '@angular/core';
import { Native } from '../../services/Native';
import { Config } from '../../services/Config';
import { Util } from '../../services/Util';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-createwalletname',
    templateUrl: './createwalletname.page.html',
    styleUrls: ['./createwalletname.page.scss'],
})
export class CreatewalletnamePage implements OnInit {
    public name: string = "";
    constructor(public route: ActivatedRoute, public native: Native) {

    }

    ngOnInit() {
        console.log('ngOnInit CreatewalletnamePage');
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
