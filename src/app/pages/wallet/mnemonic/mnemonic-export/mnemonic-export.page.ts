import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events } from '@ionic/angular';
import { AppService } from '../../../../services/app.service';
import { Config } from '../../../../config/Config';
import { Native } from '../../../../services/native.service';
import { Util } from '../../../../model/Util';
import { WalletManager } from '../../../../services/wallet.service';
import { WalletEditionService } from 'src/app/services/walletedition.service';

@Component({
    selector: 'app-mnemonic-export',
    templateUrl: './mnemonic-export.page.html',
    styleUrls: ['./mnemonic-export.page.scss'],
})
export class MnemonicExportPage implements OnInit {
    public title = '';
    public mnemonicPrompt = '';
    public payPassword: string = '';
    public masterWalletId: string = "1";
    public mnemonicList = [];
    public isShow: boolean = true;
    public isFromIntent = false;
    public requestDapp: any = null;
    public mnemonicStr: string = "";
    public walletname: string = "";
    public account: any = {};

    constructor(public route: ActivatedRoute, public walletManager: WalletManager, public zone: NgZone,
                private walletEditionService: WalletEditionService,
                public native: Native, public events: Events, public appService: AppService) {
        this.init();
    }

    ngOnInit() {
    }

    ionViewWillEnter() {
        this.masterWalletId = this.walletManager.getCurMasterWalletId();
        this.walletname = this.walletManager.getActiveMasterWallet().name;
        this.account = this.walletManager.getActiveMasterWallet().account.Type;

        this.events.subscribe("error:update", () => {
            this.isShow = true;
        });
    }

    init() {
        this.route.queryParams.subscribe((data) => {
            this.zone.run(() => {
                if (!Util.isEmptyObject(data)) {
                    console.log('From intent');
                    this.isFromIntent = true;
                    this.requestDapp = Config.requestDapp;
                    this.title = 'access-mnemonic';
                    this.mnemonicPrompt = 'text-share-mnemonic-warning';
                } else {
                    this.title = 'text-export-mnemonic';
                    this.mnemonicPrompt = 'text-mnemonic-prompt';
                }
                this.masterWalletId = this.walletEditionService.modifiedMasterWalletId;
                this.walletname = this.walletManager.getActiveMasterWallet().name;
            });
        });
    }

    checkParams() {
        if (Util.isNull(this.payPassword)) {
            this.native.toast_trans('text-pay-password-input');
            return;
        }
        if (!Util.password(this.payPassword)) {
            this.native.toast_trans('text-pwd-validator');
            return;
        }
        return true;
    }

    onNext() {
        this.native.go('/mnemonic-check', { mnemonicStr: this.mnemonicStr, mnemonicList: JSON.stringify(this.mnemonicList) });
    }

    onShare() {
        this.native.setRootRouter('/wallet-home/wallet-tab-home');
        this.appService.sendIntentResponse(this.requestDapp.action,
            { mnemonic: this.mnemonicStr }, this.requestDapp.intentId);
    }

    async onExport() {
        if (this.checkParams()) {
            let ret = await this.walletManager.spvBridge.exportWalletWithMnemonic(this.masterWalletId, this.payPassword);
            
            this.mnemonicStr = ret.toString();
            let mnemonicArr = this.mnemonicStr.split(/[\u3000\s]+/);
            for (var i = 0; i < mnemonicArr.length; i++) {
                this.mnemonicList.push({ "text": mnemonicArr[i], "selected": false });
            }
            this.isShow = false;
        }
    }

    ionViewDidLeave() {
        this.events.unsubscribe('error:update');
    }

}
