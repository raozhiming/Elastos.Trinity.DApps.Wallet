import { Component, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';
import { WalletManager } from '../../services/WalletManager';
import { Config } from '../../services/Config';
import { Native } from '../../services/Native';
import { Util } from '../../services/Util';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-exportmnemomic',
    templateUrl: './exportmnemomic.page.html',
    styleUrls: ['./exportmnemomic.page.scss'],
})
export class ExportmnemomicPage implements OnInit {

    public payPassword: string = '';
    public masterWalletId: string = "1";
    public mnemonicList = [];
    public isShow: boolean = true;
    public mnemonicStr: string = "";
    public walletname: string = "";
    public account: any = {};
    constructor(public route: ActivatedRoute, public walletManager: WalletManager, public native: Native, public events: Events) {
        this.init();
    }

    ngOnInit() {
        console.log('ngOnInit ExportmnemomicPage');
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
        this.masterWalletId = Config.modifyId;
        this.walletname = Config.getWalletName(this.masterWalletId);
    }

    checkparms() {
        if (!Util.password(this.payPassword)) {
            this.native.toast_trans("text-pwd-validator");
            return;
        }
        return true;
    }

    onNext() {
        this.native.go("/checkmnemomic", { mnemonicStr: this.mnemonicStr, mnemonicList: JSON.stringify(this.mnemonicList) })
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
            })
        }
    }

    ionViewDidLeave() {
        this.events.unsubscribe("error:update");
    }

}
