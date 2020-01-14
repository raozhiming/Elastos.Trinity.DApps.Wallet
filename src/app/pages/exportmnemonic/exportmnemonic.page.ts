import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events } from '@ionic/angular';
import { AppService } from '../../services/AppService';
import { Config } from '../../services/Config';
import { Native } from '../../services/Native';
import { Util } from '../../services/Util';
import { WalletManager } from '../../services/WalletManager';

@Component({
    selector: 'app-exportmnemonic',
    templateUrl: './exportmnemonic.page.html',
    styleUrls: ['./exportmnemonic.page.scss'],
})
export class ExportmnemonicPage implements OnInit {

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
                public native: Native, public events: Events, public appService: AppService) {
        this.init();
    }

    ngOnInit() {
        console.log('ngOnInit ExportmnemonicPage');

    }

    ionViewWillEnter() {
        this.masterWalletId = Config.getCurMasterWalletId();
        this.walletname = Config.getWalletName(this.masterWalletId);
        this.account = Config.getAccountType(this.masterWalletId);
        this.events.subscribe("error:update", () => {
            this.isShow = true;
        });
    }

    init() {
        // this.masterWalletId = Config.getCurMasterWalletId();
        this.route.queryParams.subscribe((data) => {
            this.zone.run(() => {
                if (!Util.isEmptyObject(data)) {
                    console.log('From intent');
                    this.isFromIntent = true;
                    this.requestDapp = Config.requestDapp;
                    this.title = 'accaccess-mnemonic';
                    this.mnemonicPrompt = 'text-share-mnemonic-warning';
                } else {
                    this.title = 'text-export-mnemonic';
                    this.mnemonicPrompt = 'text-mnemonic-prompt';
                }
                this.masterWalletId = Config.modifyId;
                this.walletname = Config.getWalletName(this.masterWalletId);
            });
        });
    }

    checkparms() {
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
        this.native.go('/checkmnemonic', { mnemonicStr: this.mnemonicStr, mnemonicList: JSON.stringify(this.mnemonicList) });
    }

    onShare() {
        this.native.setRootRouter('/tabs');
        this.appService.sendIntentResponse(this.requestDapp.action,
            { mnemonic: this.mnemonicStr }, this.requestDapp.intentId);
    }

    onExport() {
        if (this.checkparms()) {
            this.walletManager.exportWalletWithMnemonic(this.masterWalletId, this.payPassword, (ret) => {
                this.mnemonicStr = ret.toString();
                let mnemonicArr = this.mnemonicStr.split(/[\u3000\s]+/);
                for (var i = 0; i < mnemonicArr.length; i++) {
                    this.mnemonicList.push({ "text": mnemonicArr[i], "selected": false });
                }
                this.isShow = false;
            });
        }
    }

    ionViewDidLeave() {
        this.events.unsubscribe('error:update');
    }

}
