import { Component, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';
import { LocalStorage } from '../../../services/storage.service';
import { PopupProvider } from "../../../services/popup.service";
import { WalletManager } from '../../../services/wallet.service';
import { Native } from '../../../services/native.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Util } from 'src/app/model/Util';
import { Config } from 'src/app/config/Config';
import { AppService } from 'src/app/services/app.service';
import { WalletEditionService } from 'src/app/services/walletedition.service';
import { ThemeService } from 'src/app/services/theme.service';
import { MasterWallet } from 'src/app/model/MasterWallet';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-wallet-settings',
    templateUrl: './wallet-settings.page.html',
    styleUrls: ['./wallet-settings.page.scss'],
})
export class WalletSettingsPage implements OnInit {

    public masterWallet: MasterWallet;

    public walletName: string = "";
    private masterWalletId: string = "1";
    public masterWalletType: string = "";

    public singleAddress: boolean = false;

    public currentLanguageName: string = "";
    public readonly: string = "";

    // Helpers
    public Util = Util;
    public SELA = Config.SELA;

    public settings = [
        {
            route: "/mnemonic-export",
            title: this.translate.instant("wallet-settings-backup-wallet"),
            subtitle: this.translate.instant("wallet-settings-backup-wallet-subtitle"),
            icon: '/assets/settings/key.svg',
            iconDarkmode: '/assets/settings/darkmode/key.svg'
        },
        {
            route: "/wallet-edit-name",
            title: this.translate.instant("wallet-settings-change-name"),
            subtitle: this.translate.instant("wallet-settings-change-name-subtitle"),
            icon: '/assets/settings/pen.svg',
            iconDarkmode: '/assets/settings/darkmode/pen.svg'
        },
        {
            route: "/wallet-color",
            title: this.translate.instant("wallet-settings-change-theme"),
            subtitle: this.translate.instant("wallet-settings-change-theme-subtitle"),
            icon: '/assets/settings/picture.svg',
            iconDarkmode: '/assets/settings/darkmode/picture.svg'
        },
        // TODO delete wallet-password-reset
        // {
        //     route: "/wallet-password-reset",
        //     title: "Change Password",
        //     subtitle: "Change your wallets secure pay password",
        //     icon: '/assets/settings/lock.svg',
        //     iconDarkmode: '/assets/settings/darkmode/lock.svg'
        // },
        {
            route: "/coin-list",
            title: this.translate.instant("wallet-settings-manage-coin-list"),
            subtitle: this.translate.instant("wallet-settings-manage-coin-list-subtitle"),
            icon: '/assets/settings/coins.svg',
            iconDarkmode: '/assets/settings/darkmode/coins.svg'
        },
        {
            route: null,
            title: this.translate.instant("wallet-settings-delete-wallet"),
            subtitle: this.translate.instant("wallet-settings-delete-wallet-subtitle"),
            icon: '/assets/settings/trash.svg',
            iconDarkmode: '/assets/settings/darkmode/trash.svg'
        },
    ];

    constructor(
        public route: ActivatedRoute,
        public router: Router,
        public events: Events,
        public localStorage: LocalStorage,
        public popupProvider: PopupProvider,
        public walletManager: WalletManager,
        public native: Native,
        private translate: TranslateService,
        private walletEditionService: WalletEditionService,
        private appService: AppService,
        public theme: ThemeService
    ) {
    }

    ngOnInit() {
        this.masterWalletId = this.walletEditionService.modifiedMasterWalletId;
        this.masterWallet = this.walletManager.getMasterWallet(this.masterWalletId);
        console.log('Settings for master wallet - ' + this.masterWallet);
        this.getMasterWalletBasicInfo();
    }

    ionViewWillEnter() {
        // Update walletName when modify name
        this.walletName = this.walletManager.masterWallets[this.masterWalletId].name;

        this.appService.setBackKeyVisibility(true);
        this.appService.setTitleBarTitle("wallet-settings-title");
    }

    async onDelete() {
        let data = await this.popupProvider.ionicConfirm('confirmTitle', 'confirmSubTitle');
        if (data) {
            await this.destroyWallet(this.masterWalletId);
        }
    }

    public destroyWallet(id: string) {
        this.walletManager.destroyMasterWallet(id);
    }

    private async getMasterWalletBasicInfo() {
        console.log("2", this.masterWalletId);
        let ret = await this.walletManager.spvBridge.getMasterWalletBasicInfo(this.masterWalletId);

        this.masterWalletType = ret["Type"];
        this.singleAddress = ret["SingleAddress"];
        this.readonly = ret["InnerType"] || "";
    }

    public goToSetting(item) {
        item.route !== null ? this.native.go(item.route) : this.onDelete();
    }
}
