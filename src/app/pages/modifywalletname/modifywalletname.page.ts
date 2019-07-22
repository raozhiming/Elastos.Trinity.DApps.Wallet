import { Component, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';
import { Util } from '../../services/Util';
import { Config } from '../../services/Config';
import { Native } from '../../services/Native';
import { LocalStorage } from '../../services/Localstorage';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-modifywalletname',
    templateUrl: './modifywalletname.page.html',
    styleUrls: ['./modifywalletname.page.scss'],
})
export class ModifywalletnamePage implements OnInit {
    public walletname: string = "";
    public masterWalletId: string = "1";
    constructor(public route: ActivatedRoute, public native: Native, public localStorage: LocalStorage, public events: Events) {
        this.masterWalletId = Config.getCurMasterWalletId();
        this.walletname = Config.getWalletName(this.masterWalletId);
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

        if (Util.isWallNameExit(this.walletname)) {
            this.native.toast_trans("text-wallet-name-validator2");
            return;
        }

        this.native.showLoading().then(() => {
            this.modifyName();
        })

    }

    modifyName() {

        let walletObj = this.native.clone(Config.masterWallObj);
        walletObj["id"] = this.masterWalletId;
        walletObj["Account"] = Config.getAccountType(this.masterWalletId);
        walletObj["wallname"] = this.walletname;
        let subWallet = Config.getSubWallet(this.masterWalletId);
        if (subWallet) {
            walletObj["coinListCache"] = subWallet;
        }

        this.localStorage.saveMappingTable(walletObj).then((data) => {
            let mappingList = this.native.clone(Config.getMappingList());
            mappingList[this.masterWalletId] = walletObj;
            Config.setWalletName(this.masterWalletId, this.walletname);
            Config.setMappingList(mappingList);
            this.native.hideLoading();
            this.native.pop();
        });
    }
}
