import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { Native } from '../../services/native.service';
import { WalletCreationService } from 'src/app/services/walletcreation.service';
import { WalletManager } from 'src/app/services/wallet.service';
import { TranslateService } from '@ngx-translate/core';

declare let appManager: AppManagerPlugin.AppManager;
declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
    selector: 'app-launcher',
    templateUrl: './launcher.page.html',
    styleUrls: ['./launcher.page.scss'],
})
export class LauncherPage implements OnInit {

    constructor(
        private appService: AppService,
        public native: Native,
        private walletCreationService: WalletCreationService,
        private walletManager: WalletManager,
        public translate: TranslateService,
    ) {
    }

    ngOnInit() {
    }

    ionViewWillEnter() {
        appManager.setVisible("show");
        titleBarManager.setBackgroundColor('#732cd0');
        titleBarManager.setForegroundMode(TitleBarPlugin.TitleBarForegroundMode.LIGHT);
        titleBarManager.setTitle(this.translate.instant('wallet'));

        if (this.walletManager.getWalletsCount() === 0) {
            this.appService.setBackKeyVisibility(false);
        } else {
            this.appService.setBackKeyVisibility(true);
        }
    }

    ionViewWillLeave() {
    }

    onNext(type: number) {
        this.walletCreationService.reset();
        this.walletCreationService.isMulti = false;
        this.walletCreationService.type = type;
        this.native.go("/wallet-create");
    }
}
