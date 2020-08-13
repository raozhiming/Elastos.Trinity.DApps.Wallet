import { Component, OnInit } from '@angular/core';
import { AppService } from '../../../services/app.service';
import { Config } from '../../../config/Config';
import { WalletManager } from '../../../services/wallet.service';
import { Native } from '../../../services/native.service';
import { PopupProvider } from '../../../services/popup.service';
import { IntentService } from 'src/app/services/intent.service';
import { StandardCoinName } from 'src/app/model/Coin';
import { ThemeService } from 'src/app/services/theme.service';

declare let appManager: AppManagerPlugin.AppManager;

type ClaimRequest = {
    name: string,
    value: any,
    reason: string // Additional usage info string provided by the caller
};

@Component({
    selector: 'app-access',
    templateUrl: './access.page.html',
    styleUrls: ['./access.page.scss'],
})
export class AccessPage implements OnInit {

    public Config = Config;
    public requestDapp: any = null;
    public masterWalletId = '1';
    public exportMnemonic = false;
    public reason = '';
    public title = '';
    public requestItems: ClaimRequest[] = [];

    constructor(
        public appService: AppService,
        private intentService: IntentService,
        public walletManager: WalletManager,
        public popupProvider: PopupProvider,
        public native: Native,
        public theme: ThemeService
    ) { }

    ngOnInit() {
        this.init();
    }

    ionViewDidEnter() {
        appManager.setVisible("show", () => {}, (err) => {});
    }

    init() {
        this.requestDapp = Config.requestDapp;
        this.masterWalletId = this.walletManager.getCurMasterWalletId();
        if (this.requestDapp.action === 'walletaccess') {
            this.organizeRequestedFields();
            this.title = 'Wallet Access from:';
        } else {
            this.exportMnemonic = true;
            this.title = 'Access Mnemonic from:';
        }
    }

    async organizeRequestedFields() {
        console.log('organizeRequestedFields:', this.requestDapp.requestFields);
        for (const key of Object.keys(this.requestDapp.requestFields)) {
            console.log('key:', key);
            const claim = this.requestDapp.requestFields[key];
            const claimValue = await this.getClaimValue(key);
            const claimRequest: ClaimRequest = {
                name: key,
                value: claimValue,
                reason: ''
            };

            this.requestItems.push(claimRequest);
        }
    }

    claimReason(claimValue: any): string {
        if (claimValue instanceof Object) {
            return claimValue.reason || null;
        }
        return null;
    }

    async getClaimValue(key) {
        let value = '';
        switch (key) {
            case 'elaaddress':
                value = await this.createAddress(StandardCoinName.ELA);
                break;
            case 'elaamount':
                // for now just return the amount of ELA Chain, not include IDChain
                value = this.walletManager.activeMasterWallet.subWallets.ELA.balance.toString();
                break;
            case 'ethaddress':
                value = await this.createAddress(StandardCoinName.ETHSC);
                break;
            default:
                console.log('Not support ', key);
                break;
        }
        return value;
    }

    async createAddress(chainId: string) {
        return await this.walletManager.spvBridge.createAddress(this.masterWalletId, chainId);
    }

    reduceArrayToDict(keyProperty: string) {
        let key: string;
        return (acc, curr, index, array) => {
            acc = acc || {};
            key = curr[keyProperty];
            acc[key] = curr.value;
            return acc;
        };
    }

    buildDeliverableList() {
        const selectedClaim = [];
        const mandatoryDict = this.requestItems.reduce(this.reduceArrayToDict('name'), {});
        selectedClaim.push(mandatoryDict);

        console.log('selectedClaim:', selectedClaim);
        return selectedClaim;
    }

    /**
     * Cancel the vote operation. Closes the screen and goes back to the calling application after
     * sending the intent response.
     */
    async cancelOperation() {
        await this.intentService.sendIntentResponse(this.requestDapp.action, { walletinfo: null }, this.requestDapp.intentId);
        this.appService.close();
    }

    async onShare() {
        if (this.exportMnemonic) {
            this.native.go('/mnemonic-export', { fromIntent: true });
        } else {
            const selectedClaim = this.buildDeliverableList();
            await this.intentService.sendIntentResponse(this.requestDapp.action,
                    {walletinfo: selectedClaim}, this.requestDapp.intentId);
            this.appService.close();
        }
    }
}
