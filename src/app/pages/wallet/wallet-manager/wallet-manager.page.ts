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
    masterList = [];
    masterWallet = {};
    Config = Config;
    constructor(public events: Events, public localStorage: LocalStorage, public native: Native, private zone: NgZone, public walletManager: WalletManager) {
        this.init();
    }

    ngOnInit() {

    }

    init() {
        this.masterList = Config.masterManager.masterList;
        this.masterWallet = Config.masterManager.masterWallet;
    }

    onNext() {
        this.native.go("/launcher");
    }

    itemSelected(id) {
        Config.modifyId = id;
        this.native.go("/wallet-setting");
    }
}
