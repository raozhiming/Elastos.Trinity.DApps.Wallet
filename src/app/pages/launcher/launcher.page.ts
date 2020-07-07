import { Component, OnInit } from '@angular/core';
import { Native } from '../../services/native.service';
import { WalletCreationService } from 'src/app/services/walletcreation.service';

declare let appManager: AppManagerPlugin.AppManager;

@Component({
    selector: 'app-launcher',
    templateUrl: './launcher.page.html',
    styleUrls: ['./launcher.page.scss'],
})
export class LauncherPage implements OnInit {

    constructor(public native: Native, private walletCreationService: WalletCreationService) {
    }

    ngOnInit() {
    }

    ionViewDidEnter() {
        appManager.setVisible("show");
    }

    onNext(type) {
        this.walletCreationService.reset();
        this.walletCreationService.isMulti = false;

        switch (type) {
            case 1:
                this.native.go("/wallet-create");
                break;
            case 2:
                this.native.go("/wallet-import");
                break;
            case 3:
                this.walletCreationService.isMulti = true;
                this.native.go("/createmultiwallet");
                break;
        }
    }
}
