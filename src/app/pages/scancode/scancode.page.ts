import { Component, OnInit, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Native } from '../../services/native.service';
import { WalletManager } from '../../services/wallet.service'
import { Config } from '../../config/Config';
import { ActivatedRoute } from '@angular/router';

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
    constructor(public route: ActivatedRoute, public native: Native, public walletManager: WalletManager, public zone: NgZone, public plt: Platform) {
        this.iwidth = (this.plt.width() - 10).toString();
        this.route.queryParams.subscribe((data) => {
            let params = data;
            this.fee = params["tx"]["fee"];
            let txObj = params["tx"]["raw"];

            this.txHash = txObj["TxHash"];
            this.toAddress = txObj["Outputs"][0]["Address"];
            this.amount = txObj["Outputs"][0]["Amount"] / Config.SELA + "";

            this.zone.run(() => {
                this.qrcode = JSON.stringify(params);
            });
            this.native.info(data);
        });
    }

    ngOnInit() {
    }

}
