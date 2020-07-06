import { Injectable, NgZone } from '@angular/core';
import { Events } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Native } from './native.service';
import { Config } from '../config/Config';
import { Util } from '../model/Util';
import { WalletManager, CoinObjTEMP } from './wallet.service';
import { Transfer } from '../model/Transfer';

declare let appManager: AppManagerPlugin.AppManager;
declare let titleBarManager: TitleBarPlugin.TitleBarManager;

export enum ScanType {
    Address     = 1,
    Publickey   = 2,
    PrivateKey  = 3,
}

@Injectable({
    providedIn: 'root'
})
export class AppService {
    // private currentLang: string = null;
    private isReceiveIntentReady = false;
    private app_version = '';

    constructor(private zone: NgZone, private translate: TranslateService, public events: Events, public native: Native, private walletManager: WalletManager) {
        // this.translate.onLangChange.subscribe(data => {
        //     console.log("onLangChange");
        //     me.onLangChange(data.lang);
        // });
    }

    init() {
        console.log("AppmanagerService init");
        appManager.setListener((msg)=>{
            this.onMessageReceived(msg);
        });
        this.getLanguage();
        // alert(screen.width + " + " + document.documentElement.clientWidth + " + " + window.innerWidth + " " + window.devicePixelRatio);

        titleBarManager.setBackgroundColor("#000000");
        titleBarManager.setForegroundMode(TitleBarPlugin.TitleBarForegroundMode.LIGHT);

        this.setIntentListener();
    }

    setIntentListener() {
        if (!this.isReceiveIntentReady) {
            this.isReceiveIntentReady = true;
            appManager.setIntentListener((intent: AppManagerPlugin.ReceivedIntent)=>{
              this.onReceiveIntent(intent);
            });
        }
    }

    getLanguage() {
        var me = this;
        appManager.getLocale(
            (defaultLang, currentLang, systemLang) => {
                console.log('defaultLang', defaultLang, ' currentLang:', currentLang, ' systemLang:', systemLang);
                me.setCurLang(currentLang);
            }
        );
    }

    setCurLang(lang: string) {
        this.zone.run(()=> {
            this.translate.use(lang);
        });
        if (lang === 'en') {
            this.native.setMnemonicLang('english');
        } else if (lang === 'zh') {
            this.native.setMnemonicLang('chinese');
        } else {
            this.native.setMnemonicLang('english');
        }
    }

    getVersionReal(): Promise<string> {
        return new Promise((resolve, reject) => {
            appManager.getInfo(
                (appInfo) => {
                    console.log('appInfo', appInfo);
                    resolve(appInfo.version);
                },
                (err) => {
                    reject(err);
                }
            );
        });
    }

    async getVersion() {
        if (this.app_version !== '') {
            return this.app_version;
        } else {
            this.app_version = await this.getVersionReal();
            return this.app_version;
        }
    }

    launcher() {
        appManager.launcher();
    }

    start(id: string) {
        appManager.start(id, () => {});
    }

    close() {
        appManager.close();
    }

    onMessageReceived(ret) {
        // console.log("ElastosJS  HomePage receive message:" + ret.message + ". type: " + ret.type + ". from: " + ret.from);
        let params: any = ret.message;
        if (typeof (params) === 'string') {
            params = JSON.parse(params);
        }
        // console.log(params);
        switch (ret.type) {
            case AppManagerPlugin.MessageType.IN_REFRESH:
                switch (params.action) {
                    case 'currentLocaleChanged':
                        this.setCurLang(params.data);
                        break;
                }
                break;
            case AppManagerPlugin.MessageType.EX_INSTALL:
                break;
        }
    }

    onReceiveIntent(intent: AppManagerPlugin.ReceivedIntent) {
        console.log("Intent received message:", intent.action, ". params: ", intent.params, ". from: ", intent.from);

        switch (intent.action) {
            case 'elawalletmnemonicaccess':
            case 'walletaccess':
                this.handleAccessIntent(intent);
                break;
            default:
                this.handleTransactionIntent(intent);
                break;
        }
    }

    handleTransactionIntent(intent: AppManagerPlugin.ReceivedIntent) {
        if (Util.isEmptyObject(intent.params)) {
            console.error('Invalid intent parameters received. No params.', intent.params);
            return false;
        }

        this.walletManager.coinObj = new CoinObjTEMP();
        this.walletManager.coinObj.walletInfo = this.walletManager.curMaster.account;
        this.walletManager.coinObj.transfer = new Transfer();
        
        this.walletManager.coinObj.transfer.memo = intent.params.memo || '';
        this.walletManager.coinObj.transfer.intentId = intent.intentId;
        this.walletManager.coinObj.transfer.action = intent.action;
        this.walletManager.coinObj.transfer.from = intent.from;
        this.walletManager.coinObj.transfer.payPassword = '';
        this.walletManager.coinObj.transfer.fee = 0;
        this.walletManager.coinObj.transfer.chainId = 'ELA';

        switch (intent.action) {
            case 'crmembervote':
                console.log('CR member vote Transaction intent content:', intent.params);
                this.walletManager.coinObj.transfer.votes = intent.params.votes;
                this.walletManager.coinObj.transfer.invalidCandidates = intent.params.invalidCandidates || '[]';
                break;

            case 'crmemberregister':
                console.log('CR member register Transaction intent content:', intent.params);
                this.walletManager.coinObj.transfer.did = intent.params.did;
                this.walletManager.coinObj.transfer.nickname = intent.params.nickname;
                this.walletManager.coinObj.transfer.url = intent.params.url;
                this.walletManager.coinObj.transfer.location = intent.params.location;
                break;

            case 'crmemberupdate':
                console.log('CR member update Transaction intent content:', intent.params);
                this.walletManager.coinObj.transfer.nickname = intent.params.nickname;
                this.walletManager.coinObj.transfer.url = intent.params.url;
                this.walletManager.coinObj.transfer.location = intent.params.location;
                break;

            case 'crmemberunregister':
                console.log('CR member unregister Transaction intent content:', intent.params);
                this.walletManager.coinObj.transfer.crDID = intent.params.crDID;
                break;

            case 'crmemberretrieve':
                console.log('CR member retrieve Transaction intent content:', intent.params);
                this.walletManager.coinObj.transfer.chainId = 'IDChain';
                this.walletManager.coinObj.transfer.amount = intent.params.amount;
                this.walletManager.coinObj.transfer.publickey = intent.params.publickey;
                break;

            case 'dposvotetransaction':
                console.log('DPOS Transaction intent content:', intent.params);
                this.walletManager.coinObj.transfer.toAddress = 'default';
                this.walletManager.coinObj.transfer.publicKeys = intent.params.publickeys;
                break;

            case 'didtransaction':
                this.walletManager.coinObj.transfer.chainId = 'IDChain';
                this.walletManager.coinObj.transfer.didrequest = intent.params.didrequest;
                break;

            case 'pay':
                this.walletManager.coinObj.transfer.toAddress = intent.params.receiver;
                this.walletManager.coinObj.transfer.amount = intent.params.amount;
                this.walletManager.coinObj.transfer.type = 'payment-confirm';
                break;
            default:
                console.log('AppService unknown intent:', intent);
                return;
        }

        this.native.go('/waitforsync');
    }

    handleAccessIntent(intent: AppManagerPlugin.ReceivedIntent) {
        Config.requestDapp = {
            name: intent.from,
            intentId: intent.intentId,
            action: intent.action,
            requestFields: intent.params.reqfields || intent.params,
        };
        this.native.go('/access');
    }

    sendIntentResponse(action, result, intentId) {
        appManager.sendIntentResponse(action, result, intentId, () => {
        }, (err) => {
            console.error('sendIntentResponse error!', err);
        });
    }

    scan(type: ScanType) {
        appManager.sendIntent('scanqrcode', {}, {}, (res) => {
            const content = res.result.scannedContent;
            console.log('Got scan result:', content);

            switch (type) {
                case ScanType.Address:
                    this.events.publish('address:update', content);
                    break;
                case ScanType.Publickey:
                    this.events.publish('publickey:update', content);
                    break;
                case ScanType.PrivateKey:
                    this.events.publish('privatekey:update', content);
                    break;
            }
        }, (err: any) => {
            console.error(err);
        });
    }
}
