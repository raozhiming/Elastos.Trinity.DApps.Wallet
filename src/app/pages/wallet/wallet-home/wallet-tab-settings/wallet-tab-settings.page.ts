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
import { AppService } from '../../../../services/app.service';
import { ThemeService } from 'src/app/services/theme.service';
import { Util } from '../../../../model/Util';

@Component({
    selector: 'app-wallet-tab-settings',
    templateUrl: './wallet-tab-settings.page.html',
    styleUrls: ['./wallet-tab-settings.page.scss'],
})
export class WalletTabSettingsPage implements OnInit {

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
            title: "My Wallets",
            subtitle: "Backup wallets and access their individual settings",
            icon: '/assets/settings/wallet.svg',
            iconDarkmode: '/assets/settings/darkmode/wallet.svg'
        },
    ];

    public Util = Util;

  /*   public settings = [
        {
            route: "/wallet-manager",
            label: "text-wallet-manager",
            icon: "manager",
        },
        {
            route: "/contact-list",
            label: "text-contacts",
            icon: "contact",
        },
        {
            route: "/about",
            label: "about",
            icon: "about",
            note: "v1.0",
        }
    ]; */

    constructor(
        private appService: AppService,
        public theme: ThemeService
    ) {
    }

    ngOnInit() {
    }

    ionViewWillEnter() {
      this.appService.setBackKeyVisibility(true);
      this.appService.setTitleBarTitle('Settings');
    }
}
