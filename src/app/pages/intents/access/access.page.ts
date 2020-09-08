import { Component, OnInit } from '@angular/core';
import { AppService } from '../../../services/app.service';
import { Config } from '../../../config/Config';
import { WalletManager } from '../../../services/wallet.service';
import { WalletAccessService } from '../../../services/walletaccess.service';
import { Native } from '../../../services/native.service';
import { PopupProvider } from '../../../services/popup.service';
import { IntentService } from 'src/app/services/intent.service';
import { StandardCoinName } from 'src/app/model/Coin';
import { ThemeService } from 'src/app/services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { MasterWallet } from 'src/app/model/MasterWallet';
import { UiService } from 'src/app/services/ui.service';
import { IntentTransfer } from 'src/app/services/cointransfer.service';

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
    public intentTransfer: IntentTransfer;
    public requestDapp = '';
    public masterWallet: MasterWallet = null;
    public exportMnemonic = false;
    public title = '';
    public requestItems: ClaimRequest[] = [];
    public showReason = false;

    constructor(
        public appService: AppService,
        private intentService: IntentService,
        public walletManager: WalletManager,
        public popupProvider: PopupProvider,
        public native: Native,
        private translate: TranslateService,
        public theme: ThemeService,
        private walletAccessService: WalletAccessService,
        public uiService: UiService
    ) { }

    ngOnInit() {
        this.init();
    }

    ionViewWillEnter() {
        this.appService.setTitleBarTitle(this.translate.instant('access-title'));
        appManager.setVisible("show", () => {}, (err) => {});
    }

    init() {
        this.requestDapp = this.walletAccessService.intentTransfer.from;
        this.intentTransfer = this.walletAccessService.intentTransfer;
        this.masterWallet = this.walletManager.getMasterWallet(this.walletAccessService.masterWalletId);
        if (this.intentTransfer.action === 'walletaccess') {
            this.organizeRequestedFields();
            this.title = this.translate.instant("access-subtitle-wallet-access-from");
        } else {
            this.exportMnemonic = true;
            this.title = this.translate.instant("access-subtitle-access-mnemonic-from");
        }
    }

    async organizeRequestedFields() {
        console.log('organizeRequestedFields:', this.walletAccessService.requestFields);
        for (const key of Object.keys(this.walletAccessService.requestFields)) {
            const claimValue = await this.getClaimValue(key);
            console.log('key:', key, ' value:', claimValue);
            const claimRequest: ClaimRequest = {
                name: key,
                value: claimValue,
                reason: this.claimReason(this.walletAccessService.requestFields[key])
            };
            if (claimRequest.reason) {
                this.showReason = true;
            }
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
                value = this.masterWallet.subWallets.ELA.balance.toString();
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
        return this.masterWallet.getSubWallet(chainId).createAddress();
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
        await this.intentService.sendIntentResponse(
            this.intentTransfer.action,
            { walletinfo: null, status: 'cancelled' },
            this.intentTransfer.intentId
        );
        this.appService.close();
    }

    async onShare() {
        if (this.exportMnemonic) {
            this.native.go('/mnemonic-export', { fromIntent: true });
        } else {
            const selectedClaim = this.buildDeliverableList();
            await this.intentService.sendIntentResponse(this.intentTransfer.action,
                    {walletinfo: selectedClaim}, this.intentTransfer.intentId);
            this.appService.close();
        }
    }
}
