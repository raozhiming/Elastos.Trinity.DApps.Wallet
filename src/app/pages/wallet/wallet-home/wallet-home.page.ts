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
import { AppService } from '../../../services/app.service';
import { Config } from '../../../config/Config';
import { Native } from '../../../services/native.service';
import { PopupProvider } from '../../../services/popup.service';
import { WalletManager } from 'src/app/services/wallet.service';
import { TranslateService } from '@ngx-translate/core';
import { WalletEditionService } from 'src/app/services/walletedition.service';
import { SubWallet } from 'src/app/model/SubWallet';
import { StandardCoinName } from 'src/app/model/Coin';
import { ThemeService } from 'src/app/services/theme.service';
import { Util } from '../../../model/Util';
import { MasterWallet } from 'src/app/model/MasterWallet';
import { CurrencyService } from 'src/app/services/currency.service';

declare let appManager: AppManagerPlugin.AppManager;
declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
    selector: 'app-wallet-home',
    templateUrl: './wallet-home.page.html',
    styleUrls: ['./wallet-home.page.scss'],
})
export class WalletHomePage implements OnInit {
    public masterWallet: MasterWallet = null;
    public masterWallets: MasterWallet[] = [];
    public isSingleWallet: boolean = false;

    // Helpers
    public Util = Util;
    public SELA = Config.SELA;

    // Titlebar
    private onItemClickedListener: any;

    constructor(
        public native: Native,
        public appService: AppService,
        public popupProvider: PopupProvider,
        public walletManager: WalletManager,
        private walletEditionService: WalletEditionService,
        private translate: TranslateService,
        public currencyService: CurrencyService,
        public theme: ThemeService
    ) {
    }

    ngOnInit() {
        titleBarManager.addOnItemClickedListener(this.onItemClickedListener = (menuIcon: any) => {
            this.handleItem(menuIcon.key);
        });

        if (this.walletManager.getWalletsList().length > 1) {
            this.isSingleWallet = true;
            this.masterWallet = this.walletManager.getActiveMasterWallet();
        } else {
            this.isSingleWallet = false;
            this.masterWallets = this.walletManager.getWalletsList();
        }
    }

    ionViewWillEnter() {
        this.theme.getTheme();
        appManager.setVisible("show");
        this.appService.setTitleBarTitle(this.translate.instant("wallet-home-title"));
        this.appService.setBackKeyVisibility(false);
        titleBarManager.setIcon(TitleBarPlugin.TitleBarIconSlot.OUTER_RIGHT, {
            key: "settings",
            iconPath: TitleBarPlugin.BuiltInIcon.SETTINGS
        });
    }

    ionViewDidEnter() {
        if (this.walletManager.getCurMasterWalletId() !== '-1') {
            this.promptTransfer2IDChain();
        }
    }

    ionViewWillLeave() {
        titleBarManager.setIcon(TitleBarPlugin.TitleBarIconSlot.OUTER_RIGHT, null);
    }

    handleItem(key: string) {
        switch (key) {
            case 'settings':
                this.goToGeneralSettings();
                break;
        }
    }

    goToGeneralSettings() {
        this.walletEditionService.modifiedMasterWalletId = this.walletManager.getCurMasterWalletId();
        this.native.go('/settings');

        // Not sure what this does but it throws an err using it
        // event.stopPropagation();
        return false;
    }

    goToWalletSettings(masterWallet: MasterWallet) {
        this.walletEditionService.modifiedMasterWalletId = masterWallet.id;
        this.native.go("/wallet-settings");
    }

    doRefresh(event) {
        this.walletManager.getActiveMasterWallet().getSubWalletBalance(StandardCoinName.ELA);
        this.currencyService.fetch();
        setTimeout(() => {
            event.target.complete();
        }, 1000);
    }

    promptTransfer2IDChain() {
        if (this.walletManager.needToPromptTransferToIDChain) {
            this.popupProvider.ionicAlert('text-did-balance-not-enough');
            this.walletManager.setHasPromptTransfer2IDChain();
        }
    }

    getSubWalletIcon(subWallet: SubWallet): string {
        switch (subWallet.id) {
            case StandardCoinName.ELA:
                return "assets/coins/ela-black.svg";
            case StandardCoinName.IDChain:
                return "assets/coins/ela-turquoise.svg";
            case StandardCoinName.ETHSC:
                return "assets/coins/ela-gray.svg";
            default:
                return "assets/coins/eth.svg";
        }
    }

    getWholeBalance(balance: number): number {
        return Math.trunc(balance);
    }

    getDecimalBalance(balance: number): string {
        let decimalBalance = balance - Math.trunc(balance);
        decimalBalance.toFixed(5);
        return decimalBalance.toLocaleString().slice(2);
    }

    getWalletIndex(masterWallet: MasterWallet): number {
        return this.walletManager.getWalletsList().indexOf(masterWallet);
    }
}
