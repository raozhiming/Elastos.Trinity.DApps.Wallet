import { Injectable, NgZone } from '@angular/core';
import { Events } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Native } from './Native';
import { Config } from './Config';

declare let appManager: AppManagerPlugin.AppManager;
declare let titleBarManager: TitleBarPlugin.TitleBarManager;

let myService = null;

enum MessageType {
    INTERNAL = 1,
    IN_RETURN = 2,
    IN_REFRESH = 3,

    EXTERNAL = 11,
    EX_LAUNCHER = 12,
    EX_INSTALL = 13,
    EX_RETURN = 14,
}

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

    constructor(private zone: NgZone, private translate: TranslateService, public events: Events, public native: Native) {
        myService = this;

        var me = this;
        // this.translate.onLangChange.subscribe(data => {
        //     console.log("onLangChange");
        //     me.onLangChange(data.lang);
        // });
    }

    init() {
        console.log("AppmanagerService init");
        appManager.setListener(this.onReceive);
        this.getLanguage();
        // alert(screen.width + " + " + document.documentElement.clientWidth + " + " + window.innerWidth + " " + window.devicePixelRatio);

        titleBarManager.setBackgroundColor("#000000");
        titleBarManager.setForegroundMode(TitleBarPlugin.TitleBarForegroundMode.LIGHT);
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

    onReceive(ret) {
        // console.log("ElastosJS  HomePage receive message:" + ret.message + ". type: " + ret.type + ". from: " + ret.from);
        let params: any = ret.message;
        if (typeof (params) === 'string') {
            params = JSON.parse(params);
        }
        // console.log(params);
        switch (ret.type) {
            case MessageType.IN_REFRESH:
                switch (params.action) {
                    case 'currentLocaleChanged':
                        myService.setCurLang(params.code);
                        break;
                }
                break;
            case MessageType.EX_INSTALL:
                break;
        }
    }

    onReceiveIntent(ret: AppManagerPlugin.ReceivedIntent) {
        console.log("Intent received message:", ret.action, ". params: ", ret.params, ". from: ", ret.from);

        switch (ret.action) {
            case 'elawalletmnemonicaccess':
            case 'walletaccess':
                this.handleAccessIntent(ret);
                break;
            default:
                this.handleTransactionIntent(ret);
                break;
        }
    }

    handleTransactionIntent(ret: AppManagerPlugin.ReceivedIntent) {
        Config.coinObj = {};
        Config.coinObj.walletInfo = Config.curMaster.account;
        Config.coinObj.transfer = {
            memo: ret.params.memo || '',
            intentId: ret.intentId,
            action: ret.action,
            from: ret.from,
            payPassword: '',
            fee: 0,
            chainId: 'ELA',
        };

        switch (ret.action) {
            case 'crmembervote':
                console.log('CR member vote Transaction intent content:', ret.params);
                Config.coinObj.transfer.votes = ret.params.votes;
                Config.coinObj.transfer.invalidCandidates = ret.params.invalidCandidates || '[]';
                break;

            case 'crmemberregister':
                console.log('CR member register Transaction intent content:', ret.params);
                Config.coinObj.transfer.did = ret.params.did;
                Config.coinObj.transfer.nickName = ret.params.nickName;
                Config.coinObj.transfer.url = ret.params.url;
                Config.coinObj.transfer.location = ret.params.location;
                break;

            case 'crmemberupdate':
                console.log('CR member update Transaction intent content:', ret.params);
                Config.coinObj.transfer.nickname = ret.params.nickname;
                Config.coinObj.transfer.url = ret.params.url;
                Config.coinObj.transfer.location = ret.params.location;
                break;

            case 'crmemberunregister':
                console.log('CR member unregister Transaction intent content:', ret.params);
                Config.coinObj.transfer.crDID = ret.params.crDID;
                break;

            case 'crmemberretrieve':
                console.log('CR member retrieve Transaction intent content:', ret.params);
                Config.coinObj.transfer.chainId = 'IDChain';
                Config.coinObj.transfer.amount = ret.params.amount;
                Config.coinObj.transfer.publickey = ret.params.publickey;
                break;

            case 'dposvotetransaction':
                console.log('DPOS Transaction intent content:', ret.params);
                Config.coinObj.transfer.toAddress = 'default';
                Config.coinObj.transfer.publicKeys = ret.params.publickeys;
                break;

            case 'didtransaction':
                Config.coinObj.transfer.chainId = 'IDChain';
                Config.coinObj.transfer.didrequest = ret.params.didrequest;
                break;

            case 'pay':
                Config.coinObj.transfer.toAddress = ret.params.receiver;
                Config.coinObj.transfer.amount = ret.params.amount;
                Config.coinObj.transfer.type = 'payment-confirm';
                break;
            default:
                console.log('AppService unknown intent:', ret);
                return;
        }

        myService.native.go('/waitforsync');
    }

    handleAccessIntent(ret: AppManagerPlugin.ReceivedIntent) {
        Config.requestDapp = {
            name: ret.from,
            intentId: ret.intentId,
            action: ret.action,
            reason: ret.params.reason || ''
        };
        myService.native.go('/access');
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
