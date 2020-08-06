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
            title: "Backup Wallet",
            subtitle: "View mnemonics to export and backup",
            icon: '/assets/settings/key.svg',
            iconDarkmode: '/assets/settings/darkmode/key.svg'
        },
        {
            route: "/wallet-edit-name",
            title: "Change Name",
            subtitle: "Organize your wallet with a custom name",
            icon: '/assets/settings/pen.svg',
            iconDarkmode: '/assets/settings/darkmode/pen.svg'
        },
        {
            route: "/wallet-color",
            title: "Change Color",
            subtitle: "Organize your wallet with a custom color",
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
            title: "Manage Coin List",
            subtitle: "Check which coins to display",
            icon: '/assets/settings/coins.svg',
            iconDarkmode: '/assets/settings/darkmode/coins.svg'
        },
        {
            route: null,
            title: "Delete Wallet",
            subtitle: "This will not delete your assets, you can always import this wallet again",
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
        this.appService.setTitleBarTitle("text-wallet-manager");
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
