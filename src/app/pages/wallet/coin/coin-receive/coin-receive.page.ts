import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Config } from '../../../../config/Config';
import { WalletManager } from '../../../../services/wallet.service';
import { Native } from '../../../../services/native.service';
import { CoinTransferService } from 'src/app/services/cointransfer.service';

@Component({
    selector: 'app-coin-receive',
    templateUrl: './coin-receive.page.html',
    styleUrls: ['./coin-receive.page.scss'],
})
export class CoinReceivePage implements OnInit {
    masterWalletId: string = "1";
    qrcode: string = null;
    chainId: string;
    constructor(public route: ActivatedRoute, public walletManager: WalletManager, 
        public native: Native, private coinTransferService: CoinTransferService) {
    }

    ngOnInit() {
        this.init();
    }

    init() {
        this.masterWalletId = this.walletManager.getCurMasterWalletId();
        this.chainId = this.coinTransferService.transfer.chainId;
        this.createAddress();
    }

    getAddress() {
        this.native.go("/address", { chainId: this.chainId });
    }

    async createAddress() {
        this.qrcode = await this.walletManager.spvBridge.createAddress(this.masterWalletId, this.chainId);
    }

}
