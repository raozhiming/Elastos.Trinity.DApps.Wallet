import { Component, OnInit, NgZone } from '@angular/core';
import { LocalStorage } from '../../services/Localstorage';
import { Config } from '../../services/Config';
import { Native } from '../../services/Native';
import { WalletManager } from '../../services/WalletManager';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-walletlist',
    templateUrl: './walletlist.page.html',
    styleUrls: ['./walletlist.page.scss'],
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

    itemSelected(id) {
        Config.setCurMasterWalletId(id);
    }

    onNext() {
        this.native.go("/launcher");
    }
}
