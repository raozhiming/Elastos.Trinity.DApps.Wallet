import { Injectable } from '@angular/core';
import { Events } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Native } from './Native';

declare let appService: any;
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

    public appInfos: any = {};
    public appList: any = [];
    public runningList: any = [];
    public lastList: any = [];
    public rows: any = [];
    private currentLang: string = null;

    constructor(private translate: TranslateService,
        public native: Native) {
        myService = this;

        var me = this;
        // this.translate.onLangChange.subscribe(data => {
        //     console.log("onLangChange");
        //     me.onLangChange(data.lang);
        // });
    }

    init() {
        console.log("AppmanagerService init");
        appService.setListener(this.onReceive);
        this.getLanguage();
        // alert(screen.width + " + " + document.documentElement.clientWidth + " + " + window.innerWidth + " " + window.devicePixelRatio);
    }


    print_err(err) {
        console.log("ElastosJS  Error: " + err);
    }

    // display_err(err) {
    //     appService.alertPrompt("Error", err);
    // }

    getLanguage() {
        var me = this;
        appService.getLocale(
            ret => {
                console.log(ret);
                me.setCurLang(ret.currentLang);
                me.setDefaultLang(ret.defaultLang);
                // me.setting.setSystemLang(ret.systemLang);
            },
            err => me.print_err(err)
        );
    }

    setDefaultLang(lang: string) {

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



    launcher() {
        appService.launcher();
    }

    start(id: string) {
        appService.start(id);
    }

    close() {
        appService.close();
    }

    onReceive(ret) {
        console.log("ElastosJS  HomePage receive message:" + ret.message + ". type: " + ret.type + ". from: " + ret.from);
        var params: any = ret.message;
        if (typeof (params) == "string") {
            params = JSON.parse(params);
        }
        console.log(params);
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
}
