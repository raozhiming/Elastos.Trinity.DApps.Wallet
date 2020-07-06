import { Component, OnInit, NgZone } from '@angular/core';
import { Events } from '@ionic/angular';
import { AppService } from '../../../services/app.service';
import { Config } from '../../../config/Config';
import { Native } from '../../../services/native.service';
import { PopupProvider } from '../../../services/popup.Service';
import { WalletManager, CoinName } from 'src/app/services/wallet.service';

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

    masterWalletId = '1';
    transfer: any = null;

    chainId: string;
    txId: string;
    hasOpenIDChain = false;
    walletInfo = {};

    eventType = '';
    action = '';
    nextScreen = '';


    constructor(public appService: AppService,
                public native: Native,
                public events: Events,
                public zone: NgZone,
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

    init() {
        this.transfer = this.walletManager.coinObj.transfer;
        this.chainId = this.walletManager.coinObj.transfer.chainId;
        this.walletInfo = this.walletManager.coinObj.walletInfo;
        this.masterWalletId = this.walletManager.getCurMasterWalletId();

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
                this.nextScreen = '/transfer';
                break;
            default:
                console.log('pls check the action');
                break;
        }

        if (this.chainId === CoinName.IDCHAIN) {
            const coinList = this.walletManager.getSubWalletList();
            if (coinList.length === 1) { // for now, just IDChain
                this.hasOpenIDChain = true;
            } else {
                this.hasOpenIDChain = false;
                this.confirmOpenIDChain();
            }
        }

        if (this.walletManager.curMaster.subWallets[this.chainId].progress !== 100) {
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

    confirmOpenIDChain() {
        if (!this.hasOpenIDChain) {
            this.popupProvider.ionicAlert('confirmTitle', 'no-open-side-chain');
        }
        return this.hasOpenIDChain;
    }

    doAction() {
        this.native.go(this.nextScreen);
    }

    cancelOperation() {
        this.appService.sendIntentResponse(this.transfer.action, {txid: null}, this.transfer.intentId);
        this.appService.close();
    }
}
