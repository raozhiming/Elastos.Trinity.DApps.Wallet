import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { Events } from '@ionic/angular';
import { AppService } from '../../../services/AppService';
import { Config } from '../../../services/Config';
import { Native } from '../../../services/Native';
import { PopupProvider } from '../../../services/popup';

declare let appManager: AppManagerPlugin.AppManager;

@Component({
  selector: 'app-waitforsync',
  templateUrl: './waitforsync.page.html',
  styleUrls: ['./waitforsync.page.scss'],
})
export class WaitforsyncPage implements OnInit {
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
                public popupProvider: PopupProvider) {
        // why? if do not use zone.run, then next screen may have refresh issue: text can not show.
        this.zone.run(() => {
            this.init();
        });
    }

    ngOnInit() {
        // If this screen has exist, then use intent:transaction to update
        this.events.subscribe('intent:transaction', (params) => {
            this.zone.run(() => {
                this.init();
            });
        });
    }

    ionViewDidEnter() {
      appManager.setVisible("show", ()=>{}, (err)=>{});
    }

    init() {
        this.transfer = Config.coinObj.transfer;
        this.chainId = Config.coinObj.transfer.chainId;
        this.walletInfo = Config.coinObj.walletInfo;
        this.masterWalletId = Config.getCurMasterWalletId();

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

        if (this.chainId === Config.IDCHAIN) {
            const coinList = Config.getSubWalletList();
            if (coinList.length === 1) { // for now, just IDChain
                this.hasOpenIDChain = true;
            } else {
                this.hasOpenIDChain = false;
                this.confirmOpenIDChain();
            }
        }

        if (Config.curMaster.subWallet[this.chainId].progress !== 100) {
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
