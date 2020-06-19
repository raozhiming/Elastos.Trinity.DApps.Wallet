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

import { Component, OnInit } from '@angular/core';
import { AppService } from '../../../services/AppService';
import { Config } from '../../../services/Config';
import { Native } from '../../../services/Native';
import { PopupProvider } from '../../../services/popup';

declare let appManager: AppManagerPlugin.AppManager;

@Component({
    selector: 'app-tab-home',
    templateUrl: './tab-home.page.html',
    styleUrls: ['./tab-home.page.scss'],
})
export class TabHomePage implements OnInit {
    showOn = true;
    Config = Config;
    SELA = Config.SELA;

    constructor(public native: Native, public appService: AppService, public popupProvider: PopupProvider) {
    }

    ngOnInit() {
    }

    ionViewWillEnter() {
        if (Config.getCurMasterWalletId() !== '-1') {
            this.promptTransfer2IDChain();
        }
    }

    ionViewDidEnter() {
        appManager.setVisible("show", ()=>{}, (err)=>{});
    }

    ionViewDidLeave() {
    }

    onOpen() {
        this.showOn = !this.showOn;
    }

    goSetting() {
        Config.modifyId = Config.getCurMasterWalletId();
        this.native.go('/wallet-setting');
        event.stopPropagation();
        return false;
    }

    doRefresh(event) {
        Config.masterManager.getWalletBalance(Config.getCurMasterWalletId(), "ELA");
        setTimeout(() => {
            event.target.complete();
        }, 1000);
    }

    promptTransfer2IDChain() {
        if (Config.needPromptTransfer2IDChain) {
            this.popupProvider.ionicAlert('text-did-balance-not-enough');
            Config.masterManager.setHasPromptTransfer2IDChain();
        }
    }
}
