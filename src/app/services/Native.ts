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

import { Injectable } from '@angular/core';
import { ToastController, LoadingController, NavController } from '@ionic/angular';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { TranslateService } from '@ngx-translate/core';
import { HttpService } from "../services/HttpService";
import { Logger } from "../services/Logger";
import { Router } from '@angular/router';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

/***
 * APP底层交互
 */
@Injectable()
export class Native {
    private mnemonicLang: string = "english";
    private loadingIsOpen: boolean = false;
    constructor(public toastCtrl: ToastController,
        private clipboard: Clipboard,
        public translate: TranslateService,
        // public app:IonApp,
        private loadingCtrl: LoadingController,
        public http: HttpService,
        private inappBrowser: InAppBrowser,
        private navCtrl: NavController,
        private router: Router) {

    }

    public info(message) {
        Logger.log(message, "Info");
    }

    public error(message) {
        Logger.log(message, "Error");
    }

    public warnning(message) {
        Logger.log(message, "Warnning");
    }

    public toast(_message: string = '操作完成', duration: number = 2000): void {
        //this.toast.show(message, String(duration), 'bottom').subscribe();
        this.toastCtrl.create({
            message: _message,
            duration: 2000,
            position: 'top'
        }).then(toast => toast.present());
    }

    public toast_trans(_message: string = '', duration: number = 2000): void {
        //this.toast.show(message, String(duration), 'bottom').subscribe();
        _message = this.translate.instant(_message);
        this.toastCtrl.create({
            message: _message,
            duration: 2000,
            position: 'middle'
        }).then(toast => toast.present());
    }


    /**
     * 复制到剪贴板
     * @param options
     * @constructor
     */
    copyClipboard(text) {
        return this.clipboard.copy(text);
    }

    public go(page: any, options: any = {}) {
        // console.log(options);
        this.hideLoading();
        this.navCtrl.setDirection('forward');
        this.router.navigate([page], { queryParams: options });
        // this.navCtrl.navigateForward(page, options);
    }

    public pop() {
        this.navCtrl.pop();
    }

    public openUrl(url: string) {
        const target = "_system";
        const options = "location=no";
        this.inappBrowser.create(url, target, options);
    }


    public setRootRouter(page: any,  options: any = {}) {
        this.hideLoading();
        this.navCtrl.setDirection('root');
        this.router.navigate([page], { queryParams: options });
        // this.navCtrl.navigateRoot(router, { queryParams: options });
    }

    public getMnemonicLang(): string {
        return this.mnemonicLang;
    }

    public setMnemonicLang(lang) {
        this.mnemonicLang = lang;
    }

    public clone(myObj) {
        if (typeof (myObj) != 'object') return myObj;
        if (myObj == null) return myObj;

        let myNewObj;

        if (myObj instanceof (Array)) {
            myNewObj = new Array();
        } else {
            myNewObj = new Object();
        }

        for (let i in myObj)
            myNewObj[i] = this.clone(myObj[i]);

        return myNewObj;
    }

    /**
     * 统一调用此方法显示loading
     * @param content 显示的内容
     */
    public async showLoading(content: string = '') {
        if (!this.loadingIsOpen) {
            this.loadingIsOpen = true;
            let loading = await this.loadingCtrl.create({
                message: content
            });
            return await loading.present();
            // setTimeout(() => {//最长显示10秒
            //   this.loadingIsOpen && this.loading.dismiss();
            //   this.loadingIsOpen = false;
            // }, 20000);
        }
    };

    /**
     * 关闭loading
     */
    public hideLoading(): void {
        this.loadingIsOpen && this.loadingCtrl.dismiss();
        this.loadingIsOpen = false;
    };

    public getHttp() {
        return this.http;
    }

    public getTimestamp() {
        return new Date().getTime().toString();
    }
}


