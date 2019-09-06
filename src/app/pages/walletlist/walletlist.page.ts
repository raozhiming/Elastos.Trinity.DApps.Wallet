import { Component, OnInit, NgZone } from '@angular/core';
import { Events } from '@ionic/angular';
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
    items = [];
    masterWalletId: string = "1";
    constructor(public route: ActivatedRoute,
        public events: Events,
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
        //this.items = Config.getMasterWalletIdList();
        this.masterWalletId = Config.getCurMasterWalletId();
        let mappList = Config.getMappingList();
        this.native.info(mappList);
        this.zone.run(() => {
            this.items = Config.objtoarr(mappList);
        })
        this.native.info(this.items);
    }

    itemSelected(item) {
        this.native.info(item);
        let id = item["id"];
        Config.setCurMasterWalletId(id);
        this.getAllsubWallet(id);
    }

    saveId(id) {
        this.localStorage.saveCurMasterId({ masterId: id }).then((data) => {
            this.native.info(id);
            Config.setCurMasterWalletId(id);
            this.masterWalletId = Config.getCurMasterWalletId();
            this.native.pop();
            this.events.publish("wallet:update",this.masterWalletId);
        });
    }

    onNext() {
        this.native.go("/launcher");
    }

    registerWalletListener(masterId, coin) {
        this.walletManager.registerWalletListener(masterId, coin, (data) => {
            Config.setResregister(masterId, coin, true);
            this.events.publish("register:update", masterId, coin, data);
        });
    }

    getAllsubWallet(masterId) {

        this.registerWalletListener(masterId, "ELA");
        let chinas = Config.getSubWallet(masterId);
        console.log("==========" + JSON.stringify(chinas));
        for (let chain in chinas) {
            this.registerWalletListener(masterId, chain);
        }
        this.saveId(masterId);
    }
}
