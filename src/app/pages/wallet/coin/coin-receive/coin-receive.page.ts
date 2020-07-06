import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Config } from '../../../../config/Config';
import { WalletManager } from '../../../../services/wallet.service';
import { Native } from '../../../../services/native.service';

@Component({
    selector: 'app-coin-receive',
    templateUrl: './coin-receive.page.html',
    styleUrls: ['./coin-receive.page.scss'],
})
export class CoinReceivePage implements OnInit {

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

    async createAddress() {
        this.qrcode = await this.walletManager.createAddress(this.masterWalletId, this.chainId);
    }

}
