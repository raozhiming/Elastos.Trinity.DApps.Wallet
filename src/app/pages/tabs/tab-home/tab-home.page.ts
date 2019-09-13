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

import { Component, OnInit, NgZone } from '@angular/core';
import { Config } from '../../../services/Config';
import { Native } from '../../../services/Native';

@Component({
    selector: 'app-tab-home',
    templateUrl: './tab-home.page.html',
    styleUrls: ['./tab-home.page.scss'],
})
export class TabHomePage implements OnInit {
    masterWalletId: string = "1";
    elaPer: any;
    idChainPer: any;
    walletName = 'myWallet';
    showOn: boolean = true;
    ElaObj = { "name": "ELA", "balance": 0 };
    coinList = [];
    account: any = {};
    elaMaxHeight: any;
    elaCurHeight: any;
    idChainMaxHeight: any;
    idChainCurHeight: any;
    Config = Config;

    constructor(public native: Native) {
    }

    ngOnInit() {
    }

    ionViewWillEnter() {
    }

    ionViewDidLeave() {
    }


    onOpen() {
        this.showOn = !this.showOn;
    }

    goPayment() {
        // this.localStorage.get('payment').then((val) => {
        //     if (val) {
        //         this.localStorage.remove('payment');
        //         this.native.go("/payment-confirm", JSON.parse(val));
        //     }
        // });
    }

    goSetting() {
        Config.modifyId = Config.getCurMasterWalletId();
        this.native.go("/wallet-setting");
        event.stopPropagation();
        return false;
    }

    doRefresh(event) {
        //this.init();
        // this.walletManager.getWalletBalance(this.masterWalletId, "ELA");
        Config.masterManager.getWalletBalance(Config.getCurMasterWalletId(), "ELA");
        setTimeout(() => {
            event.target.complete();
        }, 1000);
    }
}
