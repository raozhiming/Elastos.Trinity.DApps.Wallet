import { Injectable } from '@angular/core';
import { Events } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Native } from './Native';
import { Config } from './Config';

declare let appManager: AppManagerPlugin.AppManager;
let myService = null;

enum MessageType {
    INTERNAL = 1,
    IN_RETURN = 2,
    IN_REFRESH = 3,

    EXTERNAL = 11,
    EX_LAUNCHER = 12,
    EX_INSTALL = 13,
    EX_RETURN = 14,
};

@Injectable({
    providedIn: 'root'
})
export class AppService {

    // private currentLang: string = null;
    private isReceiveIntentReady = false;
    private app_version = '';

    constructor(private translate: TranslateService, public events: Events, public native: Native) {
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
        this.translate.use(lang);
        if (lang == 'en') {
            this.native.setMnemonicLang("english");
        } else if (lang == "zh") {
            this.native.setMnemonicLang("chinese");
        } else {
            this.native.setMnemonicLang("english");
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
        var params: any = ret.message;
        if (typeof (params) == "string") {
            params = JSON.parse(params);
        }
        // console.log(params);
        switch (ret.type) {
            case MessageType.IN_REFRESH:
                switch (params.action) {
                    case "currentLocaleChanged":
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
        // console.log(ret);
        switch (ret.action) {
            case 'pay':
                Config.coinObj = {};
                Config.coinObj.chainId = 'ELA';
                Config.coinObj.walletInfo = Config.curMaster.account;
                Config.coinObj.transfer = {
                    toAddress: ret.params.receiver,
                    amount: ret.params.amount,
                    memo: ret.params.memo || "",
                    fee: 0,
                    payPassword: '',
                    intentId: ret.intentId,
                    action: ret.action,
                    from: ret.from,
                };
                Config.coinObj.transfer.type = 'payment-confirm';
                myService.native.go('/waitforsync');
                break;

            case 'dposvotetransaction':
                console.log('DPOS Transaction intent content:', ret.params);
                Config.coinObj = {};
                Config.coinObj.chainId = 'ELA';
                Config.coinObj.walletInfo = Config.curMaster.account;
                Config.coinObj.transfer = {
                    toAddress: 'default',
                    publicKeys: ret.params.publickeys,
                    memo: '',
                    fee: 0,
                    payPassword: '',
                    intentId: ret.intentId,
                    action: ret.action,
                    from: ret.from,
                };
                Config.coinObj.transfer.type = 'vote-UTXO';
                myService.native.go('/waitforsync');
                break;

            case 'didtransaction':
                Config.coinObj = {};
                Config.coinObj.chainId = 'IDChain';
                Config.coinObj.walletInfo = Config.curMaster.account;
                Config.coinObj.transfer = {
                    // toAddress: "default",
                    didrequest: ret.params.didrequest,
                    memo: ret.params.memo || '',
                    intentId: ret.intentId,
                    action: ret.action,
                    from: ret.from,
                };
                Config.coinObj.transfer.type = 'did-confirm';
                myService.native.go('/waitforsync');
                break;

            case 'elawalletmnemonicaccess':
                Config.requestDapp = {
                    name: ret.from,
                    intentId: ret.intentId,
                    action: ret.action,
                    reason: ''
                };
                myService.native.go('/access');
                break;

            case 'walletaccess':
                Config.requestDapp = {
                    name: ret.from,
                    intentId: ret.intentId,
                    action: ret.action,
                    // reason: ret.params.elaaddress.reason || ''
                    reason: ret.params.reason || ''
                };
                myService.native.go('/access');
                break;
            default:
                break;
        }
    }

    sendIntentResponse(action, result, intentId) {
        appManager.sendIntentResponse(action, result, intentId, () => {
        }, (err) => {
            console.error('sendIntentResponse error!', err);
        });
    }

    scan(type) {
        appManager.sendIntent('scanqrcode', {}, {}, (res) => {
            const content = res.result.scannedContent;
            console.log('Got scan result:', content);

            switch (type) {
                case '1':
                    this.events.publish('address:update', content);
                    break;
                case '3':
                    const senddata = { 'content': content, type: 4 };
                    this.native.go('/txdetails', senddata);
                    break;
                case '4':
                    const senddata1 = { 'content': content, type: 3 };
                    this.native.go('/txdetails', senddata1);
                    break;
                case '5':
                    this.events.publish('publickey:update', content);
                    break;
                case '6':
                    this.events.publish('privatekey:update', content);
                    break;
            }
        }, (err: any) => {
            console.error(err);
        });
    }
}
