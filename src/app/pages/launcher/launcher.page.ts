import { Component, OnInit } from '@angular/core';
import { Native } from '../../services/native.service';
import { WalletCreationService } from 'src/app/services/walletcreation.service';
import { AppService } from 'src/app/services/app.service';
import { ThemeService } from 'src/app/services/theme.service';

declare let appManager: AppManagerPlugin.AppManager;
declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
    selector: 'app-launcher',
    templateUrl: './launcher.page.html',
    styleUrls: ['./launcher.page.scss'],
})
export class LauncherPage implements OnInit {

    constructor(
        public native: Native,
        private walletCreationService: WalletCreationService,
        private theme: ThemeService
    ) {
    }

    ngOnInit() {
    }

    ionViewWillEnter() {
        appManager.setVisible("show");
        titleBarManager.setBackgroundColor('#732cd0');
        titleBarManager.setForegroundMode(TitleBarPlugin.TitleBarForegroundMode.LIGHT);
        titleBarManager.setTitle('');
    }

    ionViewWillLeave() {
        // Revert to global theme
        this.theme.getTheme();
    }

    onNext(type: number) {
        this.walletCreationService.reset();
        this.walletCreationService.isMulti = false;
        this.walletCreationService.type = type;
        this.native.go("/wallet-create");
    }

   /*  onNext(type) {
        this.walletCreationService.reset();
        this.walletCreationService.isMulti = false;

        switch (type) {
            case 1:
                this.walletCreationService.type = 1;
                this.native.go("/wallet-create");
                break;
            case 2:
                this.walletCreationService.type = 2;
                this.native.go("/wallet-import");
                break;
            case 3:
                this.walletCreationService.isMulti = true;
                this.native.go("/createmultiwallet");
                break;
        }
    } */
}
