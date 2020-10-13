import { Component, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';
import { WalletManager } from '../../../services/wallet.service';
import { Native } from '../../../services/native.service';
import { MasterWallet } from 'src/app/model/wallets/MasterWallet';
import { WalletEditionService } from 'src/app/services/walletedition.service';
import { AppService } from 'src/app/services/app.service';
import { Util } from 'src/app/model/Util';
import { Config } from 'src/app/config/Config';
import { ThemeService } from 'src/app/services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { CoinTransferService } from 'src/app/services/cointransfer.service';
import { WalletAccessService } from 'src/app/services/walletaccess.service';
import { Router } from '@angular/router';
import { CurrencyService } from 'src/app/services/currency.service';

declare let appManager: AppManagerPlugin.AppManager;

@Component({
    selector: 'app-wallet-manager',
    templateUrl: './wallet-manager.page.html',
    styleUrls: ['./wallet-manager.page.scss'],
})
export class WalletManagerPage implements OnInit {

    public Util = Util;
    public SELA = Config.SELA;
    public forIntent = false;
    private forWalletAccess = false;

    constructor(
        public events: Events,
        public native: Native,
        public router: Router,
        private appService: AppService,
        public theme: ThemeService,
        private walletEditionService: WalletEditionService,
        public walletManager: WalletManager,
        private translate: TranslateService,
        private coinTransferService: CoinTransferService,
        private walletAccessService: WalletAccessService,
        public currencyService: CurrencyService
    ) {
    }

    ngOnInit() {
        const navigation = this.router.getCurrentNavigation();
        if (!Util.isEmptyObject(navigation.extras.state)) {
            this.forIntent = navigation.extras.state.forIntent;
            this.forWalletAccess = navigation.extras.state.forWalletAccess;

            console.log('For intent?', this.forIntent);
            console.log('For wallet access?', this.forWalletAccess);
        }
    }

    ionViewWillEnter() {
        appManager.setVisible("show", () => {}, (err) => {});
        this.theme.getTheme();
        this.forIntent ?
            this.appService.setTitleBarTitle(this.translate.instant('intent-select-wallet')) :
            this.appService.setTitleBarTitle(this.translate.instant('settings-my-wallets'));
    }

    walletSelected(masterWallet: MasterWallet) {
        if (this.forIntent) {
            if (this.forWalletAccess) {
                this.walletAccessService.masterWalletId = masterWallet.id;
                this.native.go('/access');
            } else {
                this.coinTransferService.masterWalletId = masterWallet.id;
                this.coinTransferService.walletInfo = masterWallet.account;
                this.native.go("/waitforsync");
            }
        } else {
            this.walletEditionService.modifiedMasterWalletId = masterWallet.id;
            this.native.go("/wallet-settings");
        }
    }

    getWalletIndex(masterWallet: MasterWallet): number {
       return this.walletManager.getWalletsList().indexOf(masterWallet);
    }
}
