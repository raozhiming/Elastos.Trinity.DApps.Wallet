/*
 * Copyright (c) 2019 Elastos Foundation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router, NavigationExtras } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { Config } from './services/Config';
import { LocalStorage } from "./services/Localstorage";
import { Native } from './services/Native';
import { WalletManager } from './services/WalletManager';
import { AppService } from './services/AppService';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {ß
    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        public localStorage: LocalStorage,
        private translate: TranslateService,
        public walletManager: WalletManager,
        private native: Native,
        private router: Router,
        public appService: AppService
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();
            this.walletManager.init();
            this.appService.init();
            // this.initTranslateConfig();
            this.init();
            // this.router.navigate(['/tabs']);
        });
    }


    init() {
        //this.initJsPush();

        this.localStorage.getProgress((pdata) => {
            if (pdata) {
                Config.perObj = pdata;
            }

            this.localStorage.getMappingTable((data) => {
                this.native.info(data);
                if (data) {
                    Config.setMappingList(data);
                }
                this.router.navigate(['/initialize']);
            });
        });
    }

    // //
    // onReceiveJG(param) {
    //   let serialNum = JSON.parse(param)["serialNum"];
    //   let message1 = this.translate.instant("text-Jpush-kyc-message-1");
    //   let message2 = this.translate.instant("text-Jpush-kyc-message-2");
    //   alert(message1 + serialNum + message2);
    //   //  let serialNum = JSON.parse(param)["serialNum"];
    //   //  let serids = Config.getSerIds();
    //   //  let serid = serids[serialNum];
    //   //  let did = serid["id"];
    //   //  let appName = serid["appName"];
    //   //  let appr = serid["appr"];
    //   //  let idsObj = {};
    //   //  this.ls.getKycList("kycId").then((val)=>{
    //   //      if(val == null || val === undefined || val === {} || val === ''){
    //   //           return;
    //   //      }
    //   //   idsObj = JSON.parse(val);
    //   //   idsObj[did][appName][appr]["order"][serialNum]["status"] = 1;
    //   //   this.ls.set("kycId",idsObj).then(()=>{

    //   //   });
    //   //  });
    // }

    initTranslateConfig() {
        this.translate.addLangs(["zh", "en"]);
        this.localStorage.getWalletLanguage((val) => {
            if (val == null) {
                let lang = navigator.language.substr(0, 2);
                let languageObj = {
                    name: 'English',
                    isoCode: 'en'
                };
                if (lang == 'en') {
                    languageObj = {
                        name: 'English',
                        isoCode: 'en'
                    };
                } else if (lang == 'zh') {
                    languageObj = {
                        name: '中文（简体）',
                        isoCode: 'zh'
                    };
                }
                this.localStorage.set("wallet-language", languageObj).then(() => {
                    // 设置默认语言
                    this.translate.setDefaultLang(lang);
                    this.translate.use(lang);
                    if (lang == 'en') {
                        this.native.setMnemonicLang("english")
                    } else if (lang == "zh") {
                        this.native.setMnemonicLang("chinese");
                    } else {
                        this.native.setMnemonicLang("english");
                    }
                });
            } else {
                let lang = JSON.parse(val)["isoCode"];
                this.translate.use(lang);
                if (lang == 'en') {
                    this.native.setMnemonicLang("english")
                } else if (lang == "zh") {
                    this.native.setMnemonicLang("chinese");
                } else {
                    this.native.setMnemonicLang("english");
                }
            }
        })

    }

}
