import { Component, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';
import { WalletManager } from '../../../services/wallet.service';
import { Native } from '../../../services/native.service';
import { MasterWallet } from 'src/app/model/MasterWallet';
import { WalletEditionService } from 'src/app/services/walletedition.service';
import { AppService } from 'src/app/services/app.service';
import { Util } from 'src/app/model/Util';
import { Config } from 'src/app/config/Config';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
    selector: 'app-wallet-manager',
    templateUrl: './wallet-manager.page.html',
    styleUrls: ['./wallet-manager.page.scss'],
})
export class WalletManagerPage implements OnInit {

    public Util = Util;
    public SELA = Config.SELA;

    constructor(
        public events: Events,
        public native: Native,
        private appService: AppService,
        public theme: ThemeService,
        private walletEditionService: WalletEditionService,
        public walletManager: WalletManager
    ) {
    }

    ngOnInit() {
    }

    ionViewWillEnter() {
        this.appService.setTitleBarTitle('My Wallets');
        this.theme.getTheme();
    }

    onNext() {
        this.native.go("/launcher");
    }

    walletSelected(masterWallet: MasterWallet) {
        this.walletEditionService.modifiedMasterWalletId = masterWallet.id;
        this.native.go("/wallet-settings");
    }

    getWalletIndex(masterWallet: MasterWallet): number {
       return this.walletManager.getWalletsList().indexOf(masterWallet);
    }
}
