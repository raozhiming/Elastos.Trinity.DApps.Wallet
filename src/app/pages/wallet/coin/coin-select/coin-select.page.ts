import { Component, OnInit } from '@angular/core';
import { Native } from '../../../../services/native.service';
import { ActivatedRoute } from '@angular/router';
import { WalletManager } from 'src/app/services/wallet.service';
import { SubWallet } from 'src/app/model/SubWallet';
import { StandardCoinName, CoinType } from 'src/app/model/Coin';
import { CoinTransferService } from 'src/app/services/cointransfer.service';
import { AppService } from 'src/app/services/app.service';
import { ThemeService } from 'src/app/services/theme.service';
import { Util } from 'src/app/model/Util';
import { Config } from 'src/app/config/Config';
import { TranslateService } from '@ngx-translate/core';
import { CurrencyService } from 'src/app/services/currency.service';
import { UiService } from 'src/app/services/ui.service';
import { MasterWallet } from 'src/app/model/MasterWallet';

@Component({
    selector: 'app-coin-select',
    templateUrl: './coin-select.page.html',
    styleUrls: ['./coin-select.page.scss'],
})

export class CoinSelectPage implements OnInit {

    public masterWallet: MasterWallet;
    // Available subwallets to transfer to
    public subWallets: SubWallet[] = [];

    // Helpers
    public Util = Util;
    private SELA = Config.SELA;

    constructor(
        public route: ActivatedRoute,
        public native: Native,
        private walletManager: WalletManager,
        private coinTransferService: CoinTransferService,
        public theme: ThemeService,
        private translate: TranslateService,
        private appService: AppService,
        public currencyService: CurrencyService,
        public uiService: UiService
    ) {
        this.init();
    }

    ngOnInit() {
    }

    ionViewWillEnter() {
        this.appService.setTitleBarTitle(this.translate.instant("coin-select-title"));
    }

    init() {
        this.masterWallet = this.walletManager.getMasterWallet(this.coinTransferService.masterWalletId);

        // Filter out the subwallet being transferred from
        if (this.coinTransferService.chainId !== 'ELA') {
            this.subWallets = [this.masterWallet.getSubWallet('ELA')];
        } else {
            this.subWallets = this.masterWallet.subWalletsWithExcludedCoin(this.coinTransferService.chainId, CoinType.STANDARD);
        }
    }

    onItem(wallet: SubWallet) {
        // Define subwallets to transfer to and from
        this.coinTransferService.subchainId = wallet.id;

        this.native.go("/coin-transfer");
    }
}
