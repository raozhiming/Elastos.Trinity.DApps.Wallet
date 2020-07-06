import { Component, OnInit, NgZone } from '@angular/core';
import { LocalStorage } from '../../../services/storage.service';
import { Config } from '../../../config/Config';
import { Native } from '../../../services/native.service';
import { WalletManager } from '../../../services/wallet.service';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

declare let appManager: AppManagerPlugin.AppManager;

@Component({
    selector: 'app-walletlist',
    templateUrl: './wallet-list.page.html',
    styleUrls: ['./wallet-list.page.scss'],
})
export class WalletlistPage implements OnInit {

    masterWalletId: string = "1";
    masterList = [];
    masterWallet = {};
    Config = Config;

    constructor(public route: ActivatedRoute,
        public localStorage: LocalStorage,
        public native: Native,
        private zone: NgZone,
        public translate: TranslateService,
        public walletManager: WalletManager) {
        this.init();
    }

    ngOnInit() {

    }

    init() {
        this.masterWalletId = Config.getCurMasterWalletId();
        this.zone.run(() => {
            this.masterList = Config.masterManager.masterList;
            this.masterWallet = Config.masterManager.masterWallet;
        })

    }

    ionViewDidEnter() {
        appManager.setVisible("show", ()=>{}, (err)=>{});
    }

    itemSelected(id) {
        Config.setCurMasterWalletId(id);
    }

    onNext() {
        this.native.go("/launcher");
    }
}
