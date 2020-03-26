import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Config } from '../../../services/Config';
import { WalletManager } from '../../../services/WalletManager';
import { Native } from '../../../services/Native';

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
        this.masterWalletId = Config.getCurMasterWalletId();
        this.chainId = Config.coinObj.transfer.chainId;
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
