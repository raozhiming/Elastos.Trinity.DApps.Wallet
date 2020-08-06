import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Config } from '../../../../config/Config';
import { WalletManager } from '../../../../services/wallet.service';
import { Native } from '../../../../services/native.service';
import { CoinTransferService } from 'src/app/services/cointransfer.service';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { ThemeService } from 'src/app/services/theme.service';
import { AppService } from 'src/app/services/app.service';

@Component({
    selector: 'app-coin-receive',
    templateUrl: './coin-receive.page.html',
    styleUrls: ['./coin-receive.page.scss'],
})
export class CoinReceivePage implements OnInit {

    private masterWalletId: string = '1';
    private chainId: string;
    public qrcode: string = null;

    constructor(
        public route: ActivatedRoute,
        public walletManager: WalletManager,
        public native: Native,
        private coinTransferService: CoinTransferService,
        private clipboard: Clipboard,
        public theme: ThemeService,
        private appService: AppService
    ) {
    }

    ngOnInit() {
        this.init();
    }

    init() {
        this.masterWalletId = this.walletManager.getCurMasterWalletId();
        this.chainId = this.coinTransferService.chainId;
        this.appService.setTitleBarTitle('Receive ' + this.chainId);
        this.createAddress();
    }

    copyAddress() {
        this.native.copyClipboard(this.qrcode);
        this.native.toast(this.chainId + ' address copied!');
    }

    async createAddress() {
        this.qrcode = await this.walletManager.spvBridge.createAddress(this.masterWalletId, this.chainId);
        console.log('qrcode', this.qrcode);
    }

}
