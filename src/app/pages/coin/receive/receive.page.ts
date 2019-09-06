import { Component, OnInit } from '@angular/core';
import { Util } from "../../../services/Util";
import { Config } from '../../../services/Config';
import { WalletManager } from '../../../services/WalletManager';
import { Native } from '../../../services/Native';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-receive',
    templateUrl: './receive.page.html',
    styleUrls: ['./receive.page.scss'],
})
export class ReceivePage implements OnInit {

    masterWalletId: string = "1";
    qrcode: string = null;
    chainId: string;
    constructor(public route: ActivatedRoute, public walletManager: WalletManager, public native: Native) {
    }

    ngOnInit() {
        this.init();
    }

    init() {
        this.masterWalletId = Config.getCurMasterWalletId()
        this.chainId = Config.coinObj.chainId;
        this.createAddress();
    }

    getAddress() {
        this.native.go("/address", { chainId: this.chainId });
    }

    createAddress() {
        this.walletManager.createAddress(this.masterWalletId, this.chainId, (ret) => {
            this.qrcode = ret;
        });
    }

}
