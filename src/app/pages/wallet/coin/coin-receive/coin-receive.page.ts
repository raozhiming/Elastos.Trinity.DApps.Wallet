import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WalletManager } from '../../../../services/wallet.service';
import { Native } from '../../../../services/native.service';
import { CoinTransferService } from 'src/app/services/cointransfer.service';
import { ThemeService } from 'src/app/services/theme.service';
import { AppService } from 'src/app/services/app.service';
import { TranslateService } from '@ngx-translate/core';
import { MasterWallet } from 'src/app/model/wallets/MasterWallet';
import { StandardCoinName } from 'src/app/model/Coin';

@Component({
    selector: 'app-coin-receive',
    templateUrl: './coin-receive.page.html',
    styleUrls: ['./coin-receive.page.scss'],
})
export class CoinReceivePage implements OnInit {

    public masterWallet: MasterWallet = null;
    private masterWalletId = '1';
    public chainId: string;
    public qrcode: string = null;
    public isSingleAddress = false;

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

    ionViewWillEnter() {
        this.appService.setTitleBarTitle(this.translate.instant("coin-receive-title", { coinName: this.chainId}));
    }

    init() {
        this.masterWalletId = this.coinTransferService.masterWalletId;
        this.chainId = this.coinTransferService.chainId;
        this.masterWallet = this.walletManager.getMasterWallet(this.masterWalletId);

        this.createAddress();
        this.isSingleAddressSubwallet();
    }

    isSingleAddressSubwallet() {
        if ((this.chainId === StandardCoinName.ELA) || (this.chainId === StandardCoinName.IDChain)) {
            this.isSingleAddress = this.masterWallet.account.singleAddress;
        } else {
            this.isSingleAddress = true;
        }
    }

    copyAddress() {
        this.native.copyClipboard(this.qrcode);
        this.native.toast(this.translate.instant("coin-address-copied", { coinName: this.chainId}));
    }

    async createAddress() {
        this.qrcode = await this.masterWallet.getSubWallet(this.chainId).createAddress();
        console.log('qrcode', this.qrcode);
    }

    showAddressList() {
        this.native.go('/coin-address', { masterWalletId: this.masterWalletId,
            chainId: this.chainId});
    }
}
