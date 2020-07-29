import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Config } from '../../../../config/Config';
import { WalletManager } from '../../../../services/wallet.service';
import { Native } from '../../../../services/native.service';
import { CoinTransferService } from 'src/app/services/cointransfer.service';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
    selector: 'app-coin-receive',
    templateUrl: './coin-receive.page.html',
    styleUrls: ['./coin-receive.page.scss'],
})
export class CoinReceivePage implements OnInit {

    masterWalletId: string = "1";
    qrcode: string = null;
    chainId: string;

    constructor(
        public route: ActivatedRoute,
        public walletManager: WalletManager,
        public native: Native,
        private coinTransferService: CoinTransferService,
        private clipboard: Clipboard,
        public theme: ThemeService
    ) {
    }

    ngOnInit() {
        this.init();
    }

    init() {
        this.masterWalletId = this.walletManager.getCurMasterWalletId();
        this.chainId = this.coinTransferService.transfer.chainId;
        this.createAddress();
    }

    copyAddress() {
        this.clipboard.copy(this.qrcode);
    }

    async createAddress() {
        this.qrcode = await this.walletManager.spvBridge.createAddress(this.masterWalletId, this.chainId);
    }

}
