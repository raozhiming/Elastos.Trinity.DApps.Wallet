import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Events } from '@ionic/angular';
import { AppService } from '../../../../services/app.service';
import { AuthService } from '../../../../services/auth.service';
import { Native } from '../../../../services/native.service';
import { Util } from '../../../../model/Util';
import { WalletManager } from '../../../../services/wallet.service';
import { WalletEditionService } from 'src/app/services/walletedition.service';
import { IntentService } from 'src/app/services/intent.service';
import { ThemeService } from 'src/app/services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { IntentTransfer } from 'src/app/services/cointransfer.service';
import { WalletAccessService } from 'src/app/services/walletaccess.service';

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
    public mnemonicStr: string = "";
    public walletname: string = "";
    public account: any = {};
    public intentTransfer: IntentTransfer;

    constructor(
        public router: Router,
        public walletManager: WalletManager,
        public zone: NgZone,
        private walletEditionService: WalletEditionService,
        private intentService: IntentService,
        public native: Native,
        public events: Events,
        public appService: AppService,
        private authService: AuthService,
        public theme: ThemeService,
        private translate: TranslateService,
        private walletAccessService: WalletAccessService
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
        const navigation = this.router.getCurrentNavigation();
        this.zone.run(() => {
            if (!Util.isEmptyObject(navigation.extras.state)) {
                if (navigation.extras.state.payPassword) {
                    this.masterWalletId = this.walletEditionService.modifiedMasterWalletId;
                    this.payPassword = navigation.extras.state.payPassword;
                    this.showMnemonics();
                } else {
                    console.log('From intent');
                    this.isFromIntent = true;
                    this.intentTransfer = this.walletAccessService.intentTransfer;
                    this.masterWalletId = this.walletAccessService.masterWalletId;
                    this.title = 'access-mnemonic';
                }
            } else {
                this.title = 'text-export-mnemonic';
                this.masterWalletId = this.walletEditionService.modifiedMasterWalletId;
            }

            const masterWallet = this.walletManager.getMasterWallet(this.masterWalletId);
            this.walletname = masterWallet.name;
            this.account = masterWallet.account.Type;
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

    async onExport() {
        if (await this.getPassword()) {
           this.showMnemonics();
        } else {
            // User cancel
            console.log('MnemonicExportPage user cancel');
        }
    }

    async showMnemonics() {
        const ret = await this.walletManager.spvBridge.exportWalletWithMnemonic(this.masterWalletId, this.payPassword);
        titleBarManager.setBackgroundColor('#6B26C6');
        titleBarManager.setForegroundMode(TitleBarPlugin.TitleBarForegroundMode.LIGHT);
        this.appService.setTitleBarTitle(this.translate.instant('mnemonic'));

        this.mnemonicStr = ret.toString();
        let mnemonicArr = this.mnemonicStr.split(/[\u3000\s]+/).filter(str => str.trim().length > 0);

        for (let i = 0; i < mnemonicArr.length; i++) {
            this.mnemonicList.push(mnemonicArr[i]);
        }

        this.hideMnemonic = false;
    }

    async onShare() {
        await this.intentService.sendIntentResponse(
            this.intentTransfer.action,
            { mnemonic: this.mnemonicStr },
            this.intentTransfer.intentId
        );
        this.appService.close();
    }

    return() {
        this.native.go("/wallet-settings");
    }
}
