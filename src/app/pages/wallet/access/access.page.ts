import { Component, OnInit } from '@angular/core';
import { AppService } from '../../../services/AppService';
import { Config } from '../../../services/Config';
import { WalletManager } from '../../../services/WalletManager';
import { Native } from '../../../services/Native';
import { PopupProvider } from '../../../services/popup';

@Component({
    selector: 'app-access',
    templateUrl: './access.page.html',
    styleUrls: ['./access.page.scss'],
})
export class AccessPage implements OnInit {
    Config = Config;
    SELA = Config.SELA;

    requestDapp: any = null;
    masterWalletId = '1';
    exportMnemonic = false;
    elaAddress: string = null;
    chainId = 'ELA';
    reason = '';
    title = '';

    constructor(public appService: AppService,
                public walletManager: WalletManager,
                public popupProvider: PopupProvider,
                public native: Native)
    {}

    ngOnInit() {
        this.init();
    }

    init() {
        this.requestDapp = Config.requestDapp;
        this.masterWalletId = Config.getCurMasterWalletId();
        if (this.requestDapp.action === 'walletaccess') {
            this.createAddress();
            this.title = 'access-address';
        } else {
            this.exportMnemonic = true;
            this.title = 'accaccess-mnemonic';
        }
    }

    // getAddress() {
    //   this.native.go("/address", { chainId: this.chainId });
    // }

    createAddress() {
        this.walletManager.createAddress(this.masterWalletId, this.chainId, (ret) => {
            this.elaAddress = ret;
        });
    }

    /**
     * Cancel the vote operation. Closes the screen and goes back to the calling application after
     * sending the intent response.
     */
    cancelOperation() {
        this.appService.sendIntentResponse(this.requestDapp.action, { txid: null }, this.requestDapp.intentId);
        this.native.pop();
    }

    onShare() {
        if (this.exportMnemonic) {
            this.native.go('/exportmnemomic', {fromIntent: true});
        } else {
            this.appService.sendIntentResponse(this.requestDapp.action,
                    { walletinfo: [{ elaaddress: this.elaAddress }] }, this.requestDapp.intentId);
            this.native.pop();
        }
    }
}
