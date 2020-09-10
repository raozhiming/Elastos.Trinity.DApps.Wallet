import { Component, OnInit, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Native } from '../../services/native.service';
import { WalletManager } from '../../services/wallet.service'
import { Config } from '../../config/Config';
import { Router } from '@angular/router';
import { Util } from 'src/app/model/Util';

@Component({
    selector: 'app-scancode',
    templateUrl: './scancode.page.html',
    styleUrls: ['./scancode.page.scss'],
})
export class ScanCodePage implements OnInit {
    public qrcode: string = null;
    public txHash: string = "";
    public toAddress: string = "";
    public fee: any;
    public amount: string;
    public iwidth: string = null;
    constructor(public router: Router, public native: Native, public walletManager: WalletManager, public zone: NgZone, public plt: Platform) {
        this.iwidth = (this.plt.width() - 10).toString();
        const navigation = this.router.getCurrentNavigation();
        if (!Util.isEmptyObject(navigation.extras.state)) {
            let params = navigation.extras.state;
            this.fee = params["tx"]["fee"];
            let txObj = params["tx"]["raw"];

            this.txHash = txObj["TxHash"];
            this.toAddress = txObj["Outputs"][0]["Address"];
            this.amount = txObj["Outputs"][0]["Amount"] / Config.SELA + "";

            this.zone.run(() => {
                this.qrcode = JSON.stringify(params);
            });
        }
    }

    ngOnInit() {
    }

}
