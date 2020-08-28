import { Component, OnInit, NgZone } from '@angular/core';
import { Events } from '@ionic/angular';
import { WalletManager } from '../../../services/wallet.service';
import { Native } from '../../../services/native.service';
import { MasterWallet } from 'src/app/model/MasterWallet';
import { WalletEditionService } from 'src/app/services/walletedition.service';
import { AppService } from 'src/app/services/app.service';
import { Util } from 'src/app/model/Util';
import { Config } from 'src/app/config/Config';
import { ThemeService } from 'src/app/services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { CoinTransferService } from 'src/app/services/cointransfer.service';
import { WalletAccessService } from 'src/app/services/walletaccess.service';
import { ActivatedRoute } from '@angular/router';

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
        private route: ActivatedRoute,
        private appService: AppService,
        public theme: ThemeService,
        private walletEditionService: WalletEditionService,
        public walletManager: WalletManager,
        private translate: TranslateService,
        private coinTransferService: CoinTransferService,
        private walletAccessService: WalletAccessService
    ) {
    }

    ngOnInit() {
        this.route.queryParams.subscribe((data) => {
            if (data.forIntent === 'true') {
                this.forIntent = true;
            }
            if (data.forWalletAccess === 'true') {
                this.forWalletAccess = true;
            }
            console.log('For intent?', this.forIntent);
            console.log('For wallet access?', this.forWalletAccess);
        });
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
