import { Component, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';
import { LocalStorage } from '../../../services/Localstorage';
import { PopupProvider } from "../../../services/popup";
import { WalletManager } from '../../../services/WalletManager';
import { Native } from '../../../services/Native';
import { ActivatedRoute } from '@angular/router';
import { Config } from "../../../services/Config";

@Component({
    selector: 'app-wallet-setting',
    templateUrl: './wallet-setting.page.html',
    styleUrls: ['./wallet-setting.page.scss'],
})
export class WalletSettingPage implements OnInit {

    walletName = "";
    masterWalletId: string = "1";
    public currentLanguageName: string = "";
    public readonly: string = "";
    public masterWalletType: string = "";
    public singleAddress: boolean = false;

    Config = Config;

    constructor(public route: ActivatedRoute, public events: Events,
        public localStorage: LocalStorage, public popupProvider: PopupProvider, public walletManager: WalletManager,
    /*private app: App,*/ public native: Native) {

        this.masterWalletId = Config.modifyId;
        this.getMasterWalletBasicInfo();
    }

    ngOnInit() {
    }

    ionViewWillEnter() {
        // update walletName when modify name
        this.walletName = Config.masterManager.masterWallet[this.masterWalletId].name;
    }

    onDelete() {
        this.popupProvider.ionicConfirm('confirmTitle', 'confirmSubTitle').then((data) => {
            if (data) {
                this.destroyWallet(this.masterWalletId);
            }
        });
    }


    destroyWallet(id: string) {
        //this.localStorage.remove('coinListCache').then(()=>{
        Config.masterManager.destroyMasterWallet(id);
        //});
    }


    getMasterWalletBasicInfo() {
        this.walletManager.getMasterWalletBasicInfo(this.masterWalletId, (ret) => {
            this.masterWalletType = ret["Type"];
            this.singleAddress = ret["SingleAddress"];
            this.readonly = ret["InnerType"] || "";
        });
    }
}
