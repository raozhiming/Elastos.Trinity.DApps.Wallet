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

@Component({
    selector: 'app-tab-setting',
    templateUrl: './tab-setting.page.html',
    styleUrls: ['./tab-setting.page.scss'],
})
export class TabSettingPage implements OnInit {
    public masterWalletId: string = "1";
    public masterWalletType: string = "";
    public readonly: string = "";
    public currentLanguageName: string = "";
    public isShowDeposit: boolean = false;
    public fee: number = 0;
    public feePerKb: number = 10000;
    public walletInfo = {};
    public password: string = "";
    public available = 0;

    settings = [{
        route: "/wallet-manager",
        label: "text-wallet-manager",
        icon: "manager",
    }, {
        route: "/contact-list",
        label: "text-contacts",
        icon: "contact",

    }, {
        route: "/about",
        label: "about",
        icon: "about",
        note: "v1.0",
    }];

    constructor() {
    }

    ngOnInit() {
    }

}
