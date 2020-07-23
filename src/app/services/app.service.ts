import { Events, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Native } from './native.service';
import { Config } from '../config/Config';
import { Util } from '../model/Util';
import { StandardCoinName } from '../model/Coin';
import { Injectable, NgZone } from '@angular/core';
import { CoinTransferService } from './cointransfer.service';
import { ThemeService } from './theme.service';

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
    private app_version = '';
    private startupInfo: AppManagerPlugin.StartupInfo;

    constructor(
        private zone: NgZone,
        private translate: TranslateService,
        public events: Events,
        public native: Native,
        private navCtrl: NavController,
        private coinTransferService: CoinTransferService,
        private theme: ThemeService
    ) {
    }

    private getStartupMode(): Promise<AppManagerPlugin.StartupInfo> {
        return new Promise((resolve)=>{
            appManager.getStartupMode((startupInfo: AppManagerPlugin.StartupInfo) => {
                resolve(startupInfo);
            });
        });
    }

    public runningAsAService(): boolean {
        return this.startupInfo.startupMode === 'service';
    }

    public async init() {
        console.log("AppmanagerService init");

        // Check and save startup mode info
        this.startupInfo = await this.getStartupMode();
        this.theme.getTheme();

        // Listen to raw app manager messages.
        appManager.setListener((msg)=>{
            this.onMessageReceived(msg);
        });

        this.getLanguage();

        titleBarManager.setBackgroundColor("#000000");
        titleBarManager.setForegroundMode(TitleBarPlugin.TitleBarForegroundMode.LIGHT);

        // Listen to title bar events
        titleBarManager.addOnItemClickedListener((menuIcon)=>{
            if (menuIcon.key == "back") {
              this.titlebarBackButtonHandle();
            }
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
