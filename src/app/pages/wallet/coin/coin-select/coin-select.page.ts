import { Component, OnInit } from '@angular/core';
import { Native } from '../../../../services/native.service';
import { ActivatedRoute } from '@angular/router';
import { WalletManager } from 'src/app/services/wallet.service';
import { SubWallet } from 'src/app/model/SubWallet';
import { StandardCoinName } from 'src/app/model/Coin';
import { CoinTransferService } from 'src/app/services/cointransfer.service';
import { AppService } from 'src/app/services/app.service';
import { ThemeService } from 'src/app/services/theme.service';
import { Util } from 'src/app/model/Util';
import { Config } from 'src/app/config/Config';

@Component({
    selector: 'app-coin-select',
    templateUrl: './coin-select.page.html',
    styleUrls: ['./coin-select.page.scss'],
})

export class CoinSelectPage implements OnInit {

    public subWallets: SubWallet[] = [];

    public Util = Util;
    public SELA = Config.SELA;

    constructor(
        public route: ActivatedRoute,
        public native: Native,
        private walletManager: WalletManager,
        private coinTransferService: CoinTransferService,
        public theme: ThemeService,
        private appService: AppService
    ) {
        this.init();
    }

    ngOnInit() {
        this.appService.setTitleBarTitle('Transfer To');
    }

    init() {
        // Note: we are willing to pick a sidechain subwallet here only.
        this.subWallets = this.walletManager.getActiveMasterWallet().subWalletsWithExcludedCoin(StandardCoinName.ELA);
    }

    onItem(wallet: SubWallet) {
        this.coinTransferService.transferTo = wallet.id;
        this.coinTransferService.transfer.sideChainId = wallet.id;
        this.native.go("/coin-transfer");
    }

    getSubWalletIcon(subWallet: SubWallet): string {
        switch (subWallet.id) {
            case StandardCoinName.ELA:
                return "assets/coins/ela-black.svg";
            case StandardCoinName.IDChain:
                return "assets/coins/ela-turquoise.svg";
            case StandardCoinName.ETHSC:
                return "assets/coins/ela-gray.svg";
            default:
                return "assets/coins/eth.svg";
        }
    }
}
