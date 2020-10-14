import { Component, NgZone, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';
import { AppService } from '../../../services/app.service';
import { Config } from '../../../config/Config';
import { Native } from '../../../services/native.service';
import { PopupProvider } from '../../../services/popup.service';
import { WalletManager } from 'src/app/services/wallet.service';
import { MasterWallet } from 'src/app/model/wallets/MasterWallet';
import { CoinTransferService, IntentTransfer } from 'src/app/services/cointransfer.service';
import { StandardCoinName, CoinType } from 'src/app/model/Coin';
import { IntentService } from 'src/app/services/intent.service';
import { ThemeService } from 'src/app/services/theme.service';
import { CurrencyService } from 'src/app/services/currency.service';
import { TranslateService } from '@ngx-translate/core';
import { UiService } from 'src/app/services/ui.service';
import { SubWallet } from 'src/app/model/wallets/SubWallet';

declare let appManager: AppManagerPlugin.AppManager;

@Component({
  selector: 'app-waitforsync',
  templateUrl: './waitforsync.page.html',
  styleUrls: ['./waitforsync.page.scss'],
})
export class WaitForSyncPage implements OnInit {

    Config = Config;
    SELA = Config.SELA;
    CoinType = CoinType;
    showOn = true;

    masterWallet: MasterWallet;
    public subWallet: SubWallet;

    chainId: StandardCoinName;
    txId: string;
    walletInfo = {};

    eventType = '';
    action = '';
    nextScreen = '';


    constructor(
        public appService: AppService,
        public native: Native,
        public events: Events,
        public zone: NgZone,
        private intentService: IntentService,
        private coinTransferService: CoinTransferService,
        private walletManager: WalletManager,
        public popupProvider: PopupProvider,
        public theme: ThemeService,
        public translate: TranslateService,
        public currencyService: CurrencyService,
        public uiService: UiService
    ) {
    }

    ngOnInit() {
        this.zone.run(() => {
            this.init();
            // this.native.setRootRouter('/dposvote');
        });
    }

    ionViewWillEnter() {
        this.appService.setTitleBarTitle(this.translate.instant('waitforsync-syncing'));
        appManager.setVisible("show", () => {}, (err) => {});
    }

    async init() {
        this.chainId = this.coinTransferService.chainId;
        this.walletInfo = this.coinTransferService.walletInfo;
        this.masterWallet = this.walletManager.getMasterWallet(this.coinTransferService.masterWalletId);
        this.subWallet = this.masterWallet.subWallets[this.chainId];

        console.log("Wait for sync - Master wallet:", this.masterWallet, "Chain ID:", this.chainId, "SubWallet:", this.subWallet);
        console.log('Intent Transfer params', this.coinTransferService.intentTransfer);

        switch (this.coinTransferService.intentTransfer.action) {
            case 'crmembervote':
                this.action = 'text-vote-crcouncil';
                this.nextScreen = '/crmembervote';
                break;
            case 'crmemberregister':
                this.action = 'text-crmember-register';
                this.nextScreen = '/crmemberregister';
                break;
            case 'crmemberunregister':
                this.action = 'text-crmember-unregister';
                this.nextScreen = '/crmemberregister';
                break;
            case 'crmemberupdate':
                this.action = 'text-crmember-update';
                this.nextScreen = '/crmemberregister';
                break;
            case 'crmemberretrieve':
                this.action = 'text-crmember-retrieve';
                this.nextScreen = '/crmemberregister';
                break;
            case 'didtransaction':
                this.action = 'text-did';
                this.nextScreen = '/didtransaction';
                break;
            case 'esctransaction':
                this.action = 'text-esc';
                this.nextScreen = '/esctransaction';
                break;
            case 'dposvotetransaction':
                this.action = 'text-dposvote';
                this.nextScreen = '/dposvote';
                break;
            case 'pay':
                this.action = 'text-transfer';
                this.nextScreen = '/coin-transfer';
                break;
            case 'crproposalvoteagainst':
                this.action = 'Vote against proposal';
                this.nextScreen = '/crproposalvoteagainst';
                break;
            default:
                console.log('Please check the action - ' + this.action + ' is not supported.');
                break;
        }

        // TODO: remove it, IDChain is open always?
        if (this.chainId === StandardCoinName.IDChain) {
            if (!this.masterWallet.hasSubWallet(StandardCoinName.IDChain)) {
                await this.notifyNoIDChain();
                this.cancelOperation();
                return;
            }
        }

        if (this.masterWallet.subWallets[this.chainId].progress !== 100) {
            this.eventType = this.masterWallet.id + ':' + this.chainId + ':synccompleted';
            this.events.subscribe(this.eventType, (coin) => {
                console.log('WaitforsyncPage coin:', coin);
                this.doAction();
                this.events.unsubscribe(this.eventType);
            });
        } else {
            setTimeout(() => {
                this.doAction();
            }, 1000);
        }
    }

    notifyNoIDChain() {
        return this.popupProvider.ionicAlert('confirmTitle', 'no-open-side-chain');
    }

    doAction() {
        this.native.setRootRouter(this.nextScreen);
    }

    async cancelOperation() {
        await this.intentService.sendIntentResponse(
            this.coinTransferService.intentTransfer.action,
            {txid: null, status: 'cancelled'},
            this.coinTransferService.intentTransfer.intentId
        );

        this.appService.close();
    }

    getLoadingDots(): string {
        let dots = '';
        setInterval(() => {
            dots += '.';
        }, 100);
        return dots;
    }

    getSubWalletIcon(): string {
        switch (this.chainId) {
            case 'ELA':
                return "assets/coins/ela-black.svg";
            case 'IDChain':
                return "assets/coins/ela-turquoise.svg";
            case 'ETHSC':
                return "assets/coins/ela-gray.svg";
            default:
                return "assets/coins/eth.svg";
        }
    }
}
