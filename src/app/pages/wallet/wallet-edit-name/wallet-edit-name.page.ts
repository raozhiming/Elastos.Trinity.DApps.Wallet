import { Component, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';
import { Util } from '../../../model/Util';
import { Config } from '../../../config/Config';
import { Native } from '../../../services/native.service';
import { LocalStorage } from '../../../services/storage.service';
import { ActivatedRoute } from '@angular/router';
import { WalletManager } from 'src/app/services/wallet.service';

@Component({
    selector: 'app-wallet-edit-name',
    templateUrl: './wallet-edit-name.page.html',
    styleUrls: ['./wallet-edit-name.page.scss'],
})
export class WalletEditNamePage implements OnInit {
    public walletname: string = "";
    public masterWalletId: string = "1";
    
    constructor(public route: ActivatedRoute, public native: Native, public localStorage: LocalStorage, public events: Events, private walletManager: WalletManager) {
        this.masterWalletId = Config.modifyId
        this.walletname = this.walletManager.masterWallets[this.masterWalletId].name;
    }

    ngOnInit() {
        console.log('ngOnInit ModifywalletnamePage');
    }

    modify() {
        if (Util.isNull(this.walletname)) {
            this.native.toast_trans("text-wallet-name-validator");
            return;
        }

        if (Util.isWalletName(this.walletname)) {
            this.native.toast_trans("text-wallet-name-validator1");
            return;
        }

        if (this.walletManager.walletNameExists(this.walletname)) {
            this.native.toast_trans("text-wallet-name-validator2");
            return;
        }

        this.modifyName();
    }

    async modifyName() {
        this.walletManager.masterWallets[this.masterWalletId].name = this.walletname;
        await this.walletManager.saveMasterWallets();
        this.native.pop();
    }
}
