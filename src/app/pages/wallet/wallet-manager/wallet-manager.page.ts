import { Component, OnInit, NgZone } from '@angular/core';
import { Events } from '@ionic/angular';
import { LocalStorage } from '../../../services/Localstorage';
import { WalletManager } from '../../../services/WalletManager';
import { Native } from '../../../services/Native';
import { Config } from "../../../services/Config";

@Component({
    selector: 'app-wallet-manager',
    templateUrl: './wallet-manager.page.html',
    styleUrls: ['./wallet-manager.page.scss'],
})
export class WalletManagerPage implements OnInit {
    items = [];
    masterWalletId: string = "1";
    constructor(public events: Events, public localStorage: LocalStorage, public native: Native, private zone: NgZone, public walletManager: WalletManager) {
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

    itemSelected(item: string) {
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
            //this.events.publish("wallet:update",id);
        });
    }

    onNext() {
        this.native.Go("/launcher");
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
