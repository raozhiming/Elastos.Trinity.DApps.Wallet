import { Events, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Native } from './native.service';
import { Config } from '../config/Config';
import { Util } from '../model/Util';
import { WalletManager } from './wallet.service';
import { CoinName } from '../model/MasterWallet';
import { Injectable, NgZone } from '@angular/core';
import { CoinTransferService } from './cointransfer.service';

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
    private app_version = '';

    constructor(private zone: NgZone, private translate: TranslateService, 
        public events: Events, public native: Native, private navCtrl: NavController,
        private walletManager: WalletManager, private coinTransferService: CoinTransferService) {
    }

    init() {
        console.log("AppmanagerService init");

        // Listen to raw app manager messages.
        appManager.setListener((msg)=>{
            this.onMessageReceived(msg);
        });

        this.getLanguage();

        titleBarManager.setBackgroundColor("#000000");
        titleBarManager.setForegroundMode(TitleBarPlugin.TitleBarForegroundMode.LIGHT);

        // Listen to incoming intents.
        this.setIntentListener();

        // Listen to title bar events
        titleBarManager.addOnItemClickedListener((menuIcon)=>{
            if (menuIcon.key == "back") {
              this.titlebarBackButtonHandle();
            }
        });

        // Wait until the wallet manager is ready before showing the first screen.
        this.events.subscribe("walletmanager:initialized", ()=>{
            this.showStartupScreen();
        });

        this.walletManager.init();
    }

    private showStartupScreen() {
        console.log("Computing and showing startup screen");

        appManager.hasPendingIntent(async (hasPendingIntent)=>{
            if (hasPendingIntent) {
                // There is a pending intent: directly show the intent screen
                console.log("There is a pending intent");
            }
            else {
                // No pending intent - show the appropriate startup screen
                console.log("There is no pending intent - showing home screen");

                if (Object.values(this.walletManager.masterWallets).length > 0) {
                    let storedMasterId = await this.walletManager.getCurrentMasterIdFromStorage()

                    // Wrong master id or something desynchronized. use the first wallet in the list as default
                    if (!storedMasterId || !(storedMasterId in this.walletManager.masterWallets)) {
                        console.warn("Invalid master ID retrieved from storage. Using the first wallet as default");
                        storedMasterId = Object.values(this.walletManager.masterWallets)[0].id;
                    }

                    await this.walletManager.setActiveMasterWalletId(storedMasterId);
                }
                else {
                    this.native.setRootRouter("/launcher");
                }
            }
        })
    }

    setIntentListener() {
        appManager.setIntentListener((intent: AppManagerPlugin.ReceivedIntent)=>{
            this.onReceiveIntent(intent);
        });
    }

    public setTitleBarTitle(title: string) {
        titleBarManager.setTitle(this.translate.instant(title));
    }

    public setBackKeyVisibility(showBackKey: boolean) {
        if (showBackKey) {
            titleBarManager.setIcon(TitleBarPlugin.TitleBarIconSlot.INNER_LEFT, {
                key: "back",
                iconPath: TitleBarPlugin.BuiltInIcon.BACK
            });
        }
        else {
            titleBarManager.setIcon(TitleBarPlugin.TitleBarIconSlot.INNER_LEFT, null);
        }
    }

    private async titlebarBackButtonHandle() {
        this.navCtrl.pop();
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

    private getVersionReal(): Promise<string> {
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

    public async getVersion() {
        if (this.app_version !== '') {
            return this.app_version;
        } else {
            this.app_version = await this.getVersionReal();
            return this.app_version;
        }
    }
    
    close() {
        appManager.close();
    }

    onMessageReceived(ret) {
        // console.log("App manager message received:" + ret.message + ". type: " + ret.type + ". from: " + ret.from);

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
        }
    }

    onReceiveIntent(intent: AppManagerPlugin.ReceivedIntent) {
        console.log("Intent message receive:", intent.action, ". params: ", intent.params, ". from: ", intent.from);

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
            // TODO: send intent response
            return false;
        }

        this.coinTransferService.reset();
        this.coinTransferService.walletInfo = this.walletManager.activeMasterWallet.account;        
        this.coinTransferService.transfer.memo = intent.params.memo || '';
        this.coinTransferService.transfer.intentId = intent.intentId;
        this.coinTransferService.transfer.action = intent.action;
        this.coinTransferService.transfer.from = intent.from;
        this.coinTransferService.transfer.payPassword = '';
        this.coinTransferService.transfer.fee = 0;
        this.coinTransferService.transfer.chainId = CoinName.ELA;

        switch (intent.action) {
            case 'crmembervote':
                console.log('CR member vote Transaction intent content:', intent.params);
                this.coinTransferService.transfer.votes = intent.params.votes;
                this.coinTransferService.transfer.invalidCandidates = intent.params.invalidCandidates || '[]';
                break;

            case 'crmemberregister':
                console.log('CR member register Transaction intent content:', intent.params);
                this.coinTransferService.transfer.did = intent.params.did;
                this.coinTransferService.transfer.nickname = intent.params.nickname;
                this.coinTransferService.transfer.url = intent.params.url;
                this.coinTransferService.transfer.location = intent.params.location;
                break;

            case 'crmemberupdate':
                console.log('CR member update Transaction intent content:', intent.params);
                this.coinTransferService.transfer.nickname = intent.params.nickname;
                this.coinTransferService.transfer.url = intent.params.url;
                this.coinTransferService.transfer.location = intent.params.location;
                break;

            case 'crmemberunregister':
                console.log('CR member unregister Transaction intent content:', intent.params);
                this.coinTransferService.transfer.crDID = intent.params.crDID;
                break;

            case 'crmemberretrieve':
                console.log('CR member retrieve Transaction intent content:', intent.params);
                this.coinTransferService.transfer.chainId = CoinName.IDCHAIN;
                this.coinTransferService.transfer.amount = intent.params.amount;
                this.coinTransferService.transfer.publickey = intent.params.publickey;
                break;

            case 'dposvotetransaction':
                console.log('DPOS Transaction intent content:', intent.params);
                this.coinTransferService.transfer.toAddress = 'default';
                this.coinTransferService.transfer.publicKeys = intent.params.publickeys;
                break;

            case 'didtransaction':
                this.coinTransferService.transfer.chainId = CoinName.IDCHAIN;
                this.coinTransferService.transfer.didrequest = intent.params.didrequest;
                break;

            case 'pay':
                this.coinTransferService.transfer.toAddress = intent.params.receiver;
                this.coinTransferService.transfer.amount = intent.params.amount;
                this.coinTransferService.transfer.type = 'payment-confirm';
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
