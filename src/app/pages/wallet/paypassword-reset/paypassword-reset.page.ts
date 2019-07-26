import { Component, OnInit } from '@angular/core';
import { WalletManager } from '../../../services/WalletManager';
import { Util } from "../../../services/Util";
import { Native } from '../../../services/Native';
import { ActivatedRoute } from '@angular/router';
import { Config } from "../../../services/Config";

@Component({
    selector: 'app-paypassword-reset',
    templateUrl: './paypassword-reset.page.html',
    styleUrls: ['./paypassword-reset.page.scss'],
})
export class PaypasswordResetPage implements OnInit {
    masterWalletId: string = "1";
    oldPayPassword: string;
    payPassword: string;
    rePayPassword: string;
    constructor(public route: ActivatedRoute, public walletManager: WalletManager, public native: Native) {
        // this.masterWalletId = Config.getCurMasterWalletId();
        this.masterWalletId = Config.modifyId;
    }

    ngOnInit() {
    }

    onSubmit() {
        if (!Util.password(this.payPassword)) {
            this.native.toast_trans("text-pwd-validator");
            return;
        }
        if (this.payPassword != this.rePayPassword) {
            this.native.toast_trans("text-repwd-validator");
            return;
        }
        // reset pay password
        this.walletManager.changePassword(this.masterWalletId, this.oldPayPassword, this.payPassword, (data) => {
            if (data["success"]) {
                this.native.info(data);
                this.native.toast_trans("reset-pwd-success");
                this.native.pop();
            } else {
                this.native.info(data);
            }

        });
    }

}
