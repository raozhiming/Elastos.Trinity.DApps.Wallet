import { Injectable } from '@angular/core';
import { Events } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Native } from './Native';
import { Config } from './Config';

declare let appManager: any;
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
    private isReceiveIntentReady = false;

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
        appManager.setListener(this.onReceive);
        this.getLanguage();
        // alert(screen.width + " + " + document.documentElement.clientWidth + " + " + window.innerWidth + " " + window.devicePixelRatio);
    }

    setIntentListener() {
        if (!this.isReceiveIntentReady) {
            this.isReceiveIntentReady = true;
            appManager.setIntentListener(this.onReceiveIntent);
        }
    }


    print_err(err) {
        console.log("ElastosJS  Error: " + err);
    }

    // display_err(err) {
    //     appManager.alertPrompt("Error", err);
    // }

    getLanguage() {
        var me = this;
        appManager.getLocale(
            ret => {
                // console.log(ret);
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
        appManager.launcher();
    }

    start(id: string) {
        appManager.start(id);
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

    onReceiveIntent(ret) {
        // console.log("Intent receive message:" + ret.action + ". params: " + ret.params + ". from: " + ret.fromId);
        // console.log(ret);
        switch (ret.action) {
            case "pay":
                    Config.coinObj = {};
                    Config.coinObj.chainId = "ELA";
                    Config.coinObj.walletInfo = Config.curMaster.account;
                    Config.coinObj.transfer = {
                        toAddress: ret.params.toAddress,
                        amount: ret.params.amount,
                        memo: ret.params.memo,
                        fee: 0,
                        payPassword: '',
                        intentId: ret.intentId,
                        action: ret.action,
                        from: ret.from,
                    };
                    Config.coinObj.transfer.type = "payment-confirm";
                    myService.native.go("/transfer");

                break;
                case "dposvotetransaction":
                    Config.coinObj = {};
                    Config.coinObj.chainId = "ELA";
                    Config.coinObj.walletInfo = Config.curMaster.account;
                    Config.coinObj.transfer = {
                        toAddress: "default",
                        publicKeys: ret.params.publicKeys,
                        memo: "",
                        fee: 0,
                        payPassword: '',
                        intentId: ret.intentId,
                        action: ret.action,
                        from: ret.from,
                    };
                    Config.coinObj.transfer.type = "vote-UTXO";
                    myService.native.go("/transfer");

                break;
                case "didtransaction":
                    Config.coinObj = {};
                    Config.coinObj.chainId = "ELA";
                    Config.coinObj.walletInfo = Config.curMaster.account;
                    Config.coinObj.transfer = {
                        // toAddress: "default",
                        didrequest: ret.params.didrequest,
                        memo: ret.params.memo,
                        intentId: ret.intentId,
                        action: ret.action,
                        from: ret.from,
                    };
                    Config.coinObj.transfer.type = "did-confirm";
                    myService.native.go("/transfer");

                break;
        }
    }

    sendIntentResponse(action, result, intentId) {
        appManager.sendIntentResponse(action, result, intentId);
    }

}
