import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WalletManager } from '../../../../services/wallet.service';
import { Native } from '../../../../services/native.service';
import { CoinTransferService } from 'src/app/services/cointransfer.service';
import { ThemeService } from 'src/app/services/theme.service';
import { AppService } from 'src/app/services/app.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-coin-receive',
    templateUrl: './coin-receive.page.html',
    styleUrls: ['./coin-receive.page.scss'],
})
export class CoinReceivePage implements OnInit {

    private masterWalletId = '1';
    private chainId: string;
    public qrcode: string = null;

    constructor(
        public route: ActivatedRoute,
        public walletManager: WalletManager,
        public native: Native,
        private coinTransferService: CoinTransferService,
        public theme: ThemeService,
        private translate: TranslateService,
        private appService: AppService
    ) {
    }

    ngOnInit() {
        this.init();
    }

    init() {
        this.masterWalletId = this.coinTransferService.masterWalletId;
        this.chainId = this.coinTransferService.chainId;
        this.appService.setTitleBarTitle(this.translate.instant("coin-receive-title", { coinName: this.chainId}));
        this.createAddress();
    }

    copyAddress() {
        this.native.copyClipboard(this.qrcode);
        this.native.toast(this.translate.instant("coin-address-copied", { coinName: this.chainId}));
    }

    async createAddress() {
        this.qrcode = await this.walletManager.getMasterWallet(this.masterWalletId).getSubWallet(this.chainId).createAddress();
        console.log('qrcode', this.qrcode);
    }
}
