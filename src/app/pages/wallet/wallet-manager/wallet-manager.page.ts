import { Component, OnInit, NgZone } from '@angular/core';
import { Events } from '@ionic/angular';
import { LocalStorage } from '../../../services/storage.service';
import { WalletManager } from '../../../services/wallet.service';
import { Native } from '../../../services/native.service';
import { Config } from 'src/app/config/Config';
import { MasterWallet } from 'src/app/model/MasterWallet';

@Component({
    selector: 'app-wallet-manager',
    templateUrl: './wallet-manager.page.html',
    styleUrls: ['./wallet-manager.page.scss'],
})
export class WalletManagerPage implements OnInit {
    constructor(public events: Events, public localStorage: LocalStorage, public native: Native, private zone: NgZone, public walletManager: WalletManager) {
    }

    ngOnInit() {

    }

    onNext() {
        this.native.go("/launcher");
    }

    itemSelected(id) {
        Config.modifyId = id;
        this.native.go("/wallet-settings");
    }

    getWalletsList(): MasterWallet[] {
        return Object.values(this.walletManager.masterWallets);
    }
}
