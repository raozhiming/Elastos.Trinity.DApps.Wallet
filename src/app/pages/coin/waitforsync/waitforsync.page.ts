import { Component, OnInit, NgZone } from '@angular/core';
import { Events } from '@ionic/angular';
import { AppService } from '../../../services/AppService';
import { Config } from '../../../services/Config';
import { Native } from '../../../services/Native';
import { PopupProvider } from '../../../services/popup';
// import { WalletManager } from '../../../services/WalletManager';

@Component({
  selector: 'app-waitforsync',
  templateUrl: './waitforsync.page.html',
  styleUrls: ['./waitforsync.page.scss'],
})
export class WaitforsyncPage implements OnInit {
    Config = Config;
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
                public popupProvider: PopupProvider) {
        this.init();
    }

    ngOnInit() {
    }

    init() {
        console.log(Config.coinObj);
        this.transfer = Config.coinObj.transfer;
        this.chainId = Config.coinObj.chainId;
        this.walletInfo = Config.coinObj.walletInfo;
        this.masterWalletId = Config.getCurMasterWalletId();

        switch (this.transfer.action) {
            case 'didtransaction':
                this.action = 'text-did';
                this.nextScreen = '/didtransaction';
                break;
            case 'dposvotetransaction':
                this.action = 'text-dposvote';
                this.nextScreen = '/dposvote';
                break;
            case 'pay':
                this.action = 'text-dposvote';
                this.nextScreen = '/transfer';
                break;
            default:
                console.log('pls check the action');
                break;
        }

        if (this.chainId === Config.IDCHAIN) {
            let coinList = Config.getSubWalletList();
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
