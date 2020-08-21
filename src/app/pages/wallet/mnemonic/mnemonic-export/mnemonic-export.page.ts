import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events } from '@ionic/angular';
import { AppService } from '../../../../services/app.service';
import { AuthService } from '../../../../services/auth.service';
import { Config } from '../../../../config/Config';
import { Native } from '../../../../services/native.service';
import { Util } from '../../../../model/Util';
import { WalletManager } from '../../../../services/wallet.service';
import { WalletEditionService } from 'src/app/services/walletedition.service';
import { IntentService } from 'src/app/services/intent.service';
import { ThemeService } from 'src/app/services/theme.service';
import { TranslateService } from '@ngx-translate/core';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
    selector: 'app-mnemonic-export',
    templateUrl: './mnemonic-export.page.html',
    styleUrls: ['./mnemonic-export.page.scss'],
})
export class MnemonicExportPage implements OnInit {

    public title = '';
    public payPassword: string = '';
    public masterWalletId: string = "1";
    public mnemonicList = [];
    public hideMnemonic: boolean = true;
    public isFromIntent = false;
    public requestDapp: any = null;
    public mnemonicStr: string = "";
    public walletname: string = "";
    public account: any = {};

    constructor(
        public route: ActivatedRoute,
        public walletManager: WalletManager,
        public zone: NgZone,
        private walletEditionService: WalletEditionService,
        private intentService: IntentService,
        public native: Native,
        public events: Events,
        public appService: AppService,
        private authService: AuthService,
        public theme: ThemeService,
        private translate: TranslateService
    ) {
        this.init();
    }

    ngOnInit() {
        this.appService.setTitleBarTitle(this.translate.instant('wallet-settings-backup-wallet'));
    }

    ionViewWillEnter() {
        this.events.subscribe("error:update", () => {
            this.hideMnemonic = true;
        });
    }

    ionViewWillLeave() {
        this.theme.getTheme();
        this.events.unsubscribe('error:update');
    }

    init() {
        this.route.queryParams.subscribe((data) => {
            this.zone.run(() => {
                if (!Util.isEmptyObject(data)) {
                    console.log('From intent');
                    this.isFromIntent = true;
                    this.requestDapp = Config.requestDapp;
                    this.title = 'access-mnemonic';
                } else {
                    this.title = 'text-export-mnemonic';
                }
                this.masterWalletId = this.walletEditionService.modifiedMasterWalletId;
                const masterWallet = this.walletManager.getMasterWallet(this.masterWalletId);
                this.walletname = masterWallet.name;
                this.account = masterWallet.account.Type;
            });
        });
    }

    async getPassword() {
        try {
            this.payPassword = await this.authService.getWalletPassword(this.masterWalletId, true, true);
            if (this.payPassword) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            console.error('MnemonicExportPage getWalletPassword error:' + e);
            return false;
        }
    }

    return() {
        this.native.go('/wallet-home');
    }

    async onShare() {
        await this.intentService.sendIntentResponse(
            this.requestDapp.action,
            { mnemonic: this.mnemonicStr },
            this.requestDapp.intentId
        );
        this.appService.close();
    }

    async onExport() {
        if (await this.getPassword()) {
            const ret = await this.walletManager.spvBridge.exportWalletWithMnemonic(this.masterWalletId, this.payPassword);
            titleBarManager.setBackgroundColor('#6B26C6');
            titleBarManager.setForegroundMode(TitleBarPlugin.TitleBarForegroundMode.LIGHT);
            this.appService.setTitleBarTitle(this.translate.instant('mnemonic'));

            this.mnemonicStr = ret.toString();
            let mnemonicArr = this.mnemonicStr.split(/[\u3000\s]+/);
            for (var i = 0; i < mnemonicArr.length; i++) {
                this.mnemonicList.push({ "text": mnemonicArr[i], "selected": false });
            }

            this.hideMnemonic = false;
        } else {
            // User cancel
            console.log('MnemonicExportPage use cancel');
        }
    }
}
