import { Component, OnInit, NgZone } from '@angular/core';
import { AppService } from '../../../services/app.service';
import { LocalStorage } from '../../../services/storage.service';
import { Config } from '../../../config/Config';
import { Native } from '../../../services/native.service';
import { WalletManager } from '../../../services/wallet.service';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MasterWallet } from 'src/app/model/MasterWallet';

declare let appManager: AppManagerPlugin.AppManager;

@Component({
    selector: 'app-walletlist',
    templateUrl: './wallet-list.page.html',
    styleUrls: ['./wallet-list.page.scss'],
})
export class WalletlistPage implements OnInit {
    masterWalletId: string = "1";
    masterWallets = {};
    Config = Config;

    constructor(public route: ActivatedRoute,
        public localStorage: LocalStorage,
        public native: Native,
        private zone: NgZone,
        public translate: TranslateService,
        private appService: AppService,
        public walletManager: WalletManager) {
        this.init();
    }

    ngOnInit() {

    }

    init() {
        this.masterWalletId = this.walletManager.getCurMasterWalletId();
        this.zone.run(() => {
            this.masterWallets = this.walletManager.masterWallets;
        })
    }

    ionViewWillEnter() {
        this.appService.setBackKeyVisibility(true);
    }

    ionViewDidEnter() {
        appManager.setVisible("show", ()=>{}, (err)=>{});
    }

    itemSelected(id) {
        this.walletManager.setCurMasterWalletId(id);
        this.native.setRootRouter('/wallet-home');
    }

    onNext() {
        this.native.go("/launcher");
    }

    getMasterWalletsList(): MasterWallet[] {
        return Object.values(this.walletManager.masterWallets);
    }
}
