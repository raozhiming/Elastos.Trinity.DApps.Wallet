import { Component, OnInit, NgZone } from '@angular/core';
import { Events } from '@ionic/angular';
import { AppService } from '../../../services/app.service';
import { Config } from '../../../config/Config';
import { Native } from '../../../services/native.service';
import { PopupProvider } from '../../../services/popup.service';
import { WalletManager } from 'src/app/services/wallet.service';
import { MasterWallet, CoinName } from 'src/app/model/MasterWallet';
import { CoinTransferService } from 'src/app/services/cointransfer.service';

declare let appManager: AppManagerPlugin.AppManager;

@Component({
  selector: 'app-waitforsync',
  templateUrl: './waitforsync.page.html',
  styleUrls: ['./waitforsync.page.scss'],
})
export class WaitForSyncPage implements OnInit {
    Config = Config;
    SELA = Config.SELA;
    showOn = true;

    masterWallet: MasterWallet = null;
    transfer: any = null;

    chainId: string;
    txId: string;
    walletInfo = {};

    eventType = '';
    action = '';
    nextScreen = '';


    constructor(public appService: AppService,
                public native: Native,
                public events: Events,
                public zone: NgZone,
                private coinTransferService: CoinTransferService,
                private walletManager: WalletManager,
                public popupProvider: PopupProvider) {
        // why? if do not use zone.run, then next screen may have refresh issue: text can not show.
        this.zone.run(() => {
            this.init();
        });
    }

    ngOnInit() {
    }

    ionViewDidEnter() {
      appManager.setVisible("show", ()=>{}, (err)=>{});
    }

    async init() {
        this.transfer = this.coinTransferService.transfer;
        this.chainId = this.coinTransferService.transfer.chainId;
        this.walletInfo = this.coinTransferService.walletInfo;
        this.masterWallet = this.walletManager.getActiveMasterWallet();

        switch (this.transfer.action) {
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
            case 'dposvotetransaction':
                this.action = 'text-dposvote';
                this.nextScreen = '/dposvote';
                break;
            case 'pay':
                this.action = 'text-transfer';
                this.nextScreen = '/coin-transfer';
                break;
            default:
                console.log('pls check the action');
                break;
        }

        if (this.chainId === CoinName.IDCHAIN) {
            if (!this.masterWallet.hasSubWallet(CoinName.IDCHAIN)) {
                await this.notifyNoIDChain();
                this.cancelOperation();
                return;
            }
        }

        if (this.walletManager.activeMasterWallet.subWallets[this.chainId].progress !== 100) {
            this.eventType = this.chainId + ':synccompleted';
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
        this.native.go(this.nextScreen);
    }

    cancelOperation() {
        this.appService.sendIntentResponse(this.transfer.action, {txid: null}, this.transfer.intentId);
        this.appService.close();
    }
}
