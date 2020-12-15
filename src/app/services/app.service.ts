import { Events, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Native } from './native.service';
import { Injectable, NgZone } from '@angular/core';
import { CoinTransferService } from './cointransfer.service';
import { ThemeService } from './theme.service';
import * as moment from 'moment';

declare let appManager: AppManagerPlugin.AppManager;
declare let titleBarManager: TitleBarPlugin.TitleBarManager;

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

    private getStartupModeFromRuntime(): Promise<AppManagerPlugin.StartupInfo> {
        return new Promise((resolve)=>{
            appManager.getStartupMode((startupInfo: AppManagerPlugin.StartupInfo) => {
                resolve(startupInfo);
            });
        });
    }

    public runningAsAService(): boolean {
        return this.startupInfo.startupMode === AppManagerPlugin.StartupMode.SERVICE;
    }

    public runningAsMainUI(): boolean {
        return this.startupInfo.startupMode === AppManagerPlugin.StartupMode.APP;
    }

    public getStartupMode(): string {
      return this.startupInfo.startupMode;
    }

    public async init() {
        console.log("AppmanagerService init");

        // Check and save startup mode info
        this.startupInfo = await this.getStartupModeFromRuntime();

        console.log("RUNNING AS: "+this.startupInfo.startupMode);

        // Listen to raw app manager messages.
        appManager.setListener((msg) => {
            this.onMessageReceived(msg);
        });

        this.theme.getTheme();
        this.getLanguage();

        // Listen to title bar events
        titleBarManager.addOnItemClickedListener((menuIcon) => {
            if (menuIcon.key === "back") {
              this.titlebarBackButtonHandle();
            }
        });
    }

    onMessageReceived(ret) {
        let params: any = ret.message;
        if (typeof (params) === "string") {
            try {
                params = JSON.parse(params);
            } catch (e) {
                console.log('Params are not JSON format: ', params);
            }
        }
        switch (ret.type) {
            case MessageType.IN_REFRESH:
                if (params.action === "currentLocaleChanged") {
                    this.setCurLang(params.data);
                }
                if (params.action === 'preferenceChanged' && params.data.key === "ui.darkmode") {
                    this.zone.run(() => {
                        console.log('Dark Mode toggled');
                        this.theme.setTheme(params.data.value);
                    });
                }
                break;
        }
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
            if (lang === 'zh') {
                moment.locale('zh-cn');
            } else {
                moment.locale(lang);
            }
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

    scan(type: ScanType) {
        appManager.sendIntent('https://scanner.elastos.net/scanqrcode', {}, {}, (res) => {
            let content: string = res.result.scannedContent;

            // Some address star with "xxx:", eg "etherum:"
            const index = content.indexOf(':');
            if (index !== -1) {
                content = content.substring(index + 1);
            }
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
