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

import { NgModule, Injectable, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { zh } from './../assets/i18n/zh';
import { en } from './../assets/i18n/en';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { IonicStorageModule } from '@ionic/storage';

/**provider*/
import { Clipboard } from '@ionic-native/clipboard/ngx';

import { LocalStorage } from './services/storage.service';
import { Native } from './services/native.service';
import { Logger } from './model/Logger';
import { PopupProvider } from './services/popup.service';
import { WalletManager } from './services/wallet.service';
import { LoadingService } from './services/loading.service';

import { LauncherPage } from './pages/launcher/launcher.page';
import { WalletSettingsPage } from './pages/wallet/wallet-settings/wallet-settings.page';
import { ContactCreatePage } from './pages/contacts/contact-create/contact-create.page';
import { ContactListPage } from './pages/contacts/contact-list/contact-list.page';
import { ContactsPage } from './pages/contacts/contact/contacts.page';
import { AboutPage } from './pages/about/about.page';
import { AccessPage } from './pages/intents/access/access.page';
import { DidTransactionPage } from './pages/intents/didtransaction/didtransaction.page';
import { WaitForSyncPage } from './pages/intents/waitforsync/waitforsync.page';
import { CRmembervotePage } from './pages/intents/crmembervote/crmembervote.page';
import { DPoSVotePage } from './pages/intents/dposvote/dposvote.page';
import { CRMemberRegisterPage } from './pages/intents/crmemberregister/crmemberregister.page';
import { CoinTransferPage } from './pages/wallet/coin/coin-transfer/coin-transfer.page';
import { CoinTxInfoPage } from './pages/wallet/coin/coin-tx-info/coin-tx-info.page';
import { CoinReceivePage } from './pages/wallet/coin/coin-receive/coin-receive.page';
import { CoinSelectPage } from './pages/wallet/coin/coin-select/coin-select.page';
import { CoinListPage } from './pages/wallet/coin/coin-list/coin-list.page';
import { CoinHomePage } from './pages/wallet/coin/coin-home/coin-home.page';
import { WalletCreatePage } from './pages/wallet/wallet-create/wallet-create.page';
import { WalletImportPage } from './pages/wallet/wallet-import/wallet-import.page';
import { WalletCreateNamePage } from './pages/wallet/wallet-create-name/wallet-create-name.page';
import { MnemonicWritePage } from './pages/wallet/mnemonic/mnemonic-write/mnemonic-write.page';
import { WalletlistPage } from './pages/wallet/wallet-list/wallet-list.page';
import { WalletPasswordResetPage } from './pages/wallet/wallet-password-reset/wallet-password-reset.page';
import { WalletEditNamePage } from './pages/wallet/wallet-edit-name/wallet-edit-name.page';
import { MnemonicExportPage } from './pages/wallet/mnemonic/mnemonic-export/mnemonic-export.page';
import { MnemonicCheckPage } from './pages/wallet/mnemonic/mnemonic-check/mnemonic-check.page';
import { MnemonicCreatePage } from './pages/wallet/mnemonic/mnemonic-create/mnemonic-create.page';
import { ScanCodePage } from './pages/scancode/scancode.page';
import { WalletTabSettingsPage } from './pages/wallet/wallet-home/wallet-tab-settings/wallet-tab-settings.page';
import { WalletTabsRootPage } from './pages/wallet/wallet-home/wallet-tabs-root/wallet-tabs-root.page';

import { ComponentsModule } from './components/components.module';

import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "https://b58a6612e1554e6fbeab3b24d980fead@sentry.io/1875741"
});

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  constructor() {}

  handleError(error) {
    console.error("Globally catched exception:", error);

    console.log(document.URL);
    // Only send reports to sentry if we are not debugging.
    if (document.URL.includes('localhost')) { // Prod builds or --nodebug CLI builds use "http://localhost"
      Sentry.captureException(error.originalError || error);
    }
  }
}

/** 通过类引用方式解析国家化文件 */
export class CustomTranslateLoader implements TranslateLoader {
    public getTranslation(lang: string): Observable<any> {
        return Observable.create(observer => {
            switch (lang) {
                case 'zh':
                    observer.next(zh);
                    break;
                case 'en':
                default:
                    observer.next(en);
            }

            observer.complete();
        });
    }
}

export function TranslateLoaderFactory() {
    return new CustomTranslateLoader();
}

@NgModule({
    declarations: [
        AppComponent,

        LauncherPage,
        WalletSettingsPage,
        ContactsPage,
        ContactCreatePage,
        ContactListPage,
        CRmembervotePage,
        DPoSVotePage,
        CoinTransferPage,
        DidTransactionPage,
        WalletTabSettingsPage,
        WalletTabsRootPage,
        WalletPasswordResetPage,
        WalletEditNamePage,
        WalletImportPage,
        CoinHomePage,
        CoinListPage,
        CoinSelectPage,
        CoinTxInfoPage,
        CoinReceivePage,
        CoinTransferPage,
        AboutPage,
        AccessPage,
        WalletCreateNamePage,
        CRMemberRegisterPage,
        WalletCreatePage,
        ScanCodePage,
        WaitForSyncPage,
        MnemonicWritePage,
        WalletlistPage,
        MnemonicExportPage,
        MnemonicCheckPage,
        MnemonicWritePage,
        MnemonicCreatePage
    ],
    entryComponents: [
        LauncherPage,
        WalletTabsRootPage
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        IonicStorageModule,
        FormsModule,
        ComponentsModule,
        IonicStorageModule.forRoot({
            name: '__walletdb',
            driverOrder: ['localstorage', 'indexeddb', 'sqlite', 'websql']
        }),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (TranslateLoaderFactory)
            }
        }),
    ],
    providers: [
        StatusBar,
        SplashScreen,
        Clipboard,
        InAppBrowser,
        LocalStorage,
        Native,
        Logger,
        PopupProvider,
        WalletManager,
        LoadingService,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        { provide: ErrorHandler, useClass: SentryErrorHandler }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
