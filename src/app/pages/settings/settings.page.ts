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
import { AppService } from '../../services/app.service';
import { ThemeService } from 'src/app/services/theme.service';
import { Util } from '../../model/Util';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.page.html',
    styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

    public masterWalletId: string = "1";
    public masterWalletType: string = "";
    public readonly: string = "";
    public currentLanguageName: string = "";
    public isShowDeposit: boolean = false;
    public fee: number = 0;
    public walletInfo = {};
    public password: string = "";
    public available = 0;
    public settings = [
        {
            route: "/wallet-manager",
            title: this.translate.instant("settings-my-wallets"),
            subtitle: this.translate.instant("settings-my-wallets-subtitle"),
            icon: '/assets/settings/wallet.svg',
            iconDarkmode: '/assets/settings/darkmode/wallet.svg'
        },
        {
            route: "/currency-select",
            title: this.translate.instant("settings-currency"),
            subtitle: this.translate.instant("settings-currency-subtitle"),
            icon: '/assets/settings/dollar.svg',
            iconDarkmode: '/assets/settings/darkmode/dollar.svg'
        },
  /*       {
            route: "/launcher",
            title: "Add Wallet",
            subtitle: "Create or import a new wallet",
            icon: '/assets/settings/wallet.svg',
            iconDarkmode: '/assets/settings/darkmode/wallet.svg'
        }, */
    ];

    public Util = Util;

    constructor(
        private appService: AppService,
        public theme: ThemeService,
        private translate: TranslateService
    ) {
    }

    ngOnInit() {
    }

    ionViewWillEnter() {
      this.appService.setBackKeyVisibility(true);
      this.appService.setTitleBarTitle(this.translate.instant("settings-title"));
    }
}
