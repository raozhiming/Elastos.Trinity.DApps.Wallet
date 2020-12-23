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

/****************** Angular ******************/
import { NgModule, Injectable, ErrorHandler, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { QRCodeModule } from 'angularx-qrcode';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

/****************** Ionic ******************/
import { AlertController, IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicStorageModule } from '@ionic/storage';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { IonicImageLoaderModule } from 'ionic-image-loader-v5';
import { WebView } from '@ionic-native/ionic-webview/ngx';

/****************** Sentry ******************/
import * as Sentry from "@sentry/browser";
import { RewriteFrames } from '@sentry/integrations';

import { AppComponent } from './app.component';
import { AppRoutingModule, EmptyPage } from './app-routing.module';
import { Logger } from './model/Logger';
import { ComponentsModule } from './components/components.module';

/****************** Languages ******************/
import { zh } from './../assets/i18n/zh';
import { en } from './../assets/i18n/en';
import { fr } from './../assets/i18n/fr';

/****************** Services ******************/
import { LocalStorage } from './services/storage.service';
import { Native } from './services/native.service';
import { PopupProvider } from './services/popup.service';

/****************** Pages ******************/
import { WalletHomePage } from './pages/wallet/wallet-home/wallet-home.page';
import { WalletManagerPage } from './pages/wallet/wallet-manager/wallet-manager.page';
import { CRProposalVoteAgainstPage } from './pages/intents/crproposalvoteagainst/crproposalvoteagainst.page';
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
import { CoinAddressPage } from './pages/wallet/coin/coin-address/coin-address.page';
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
import { WalletPasswordResetPage } from './pages/wallet/wallet-password-reset/wallet-password-reset.page';
import { WalletEditNamePage } from './pages/wallet/wallet-edit-name/wallet-edit-name.page';
import { MnemonicExportPage } from './pages/wallet/mnemonic/mnemonic-export/mnemonic-export.page';
import { MnemonicCreatePage } from './pages/wallet/mnemonic/mnemonic-create/mnemonic-create.page';
import { SettingsPage } from './pages/settings/settings.page';
import { EscTransactionPage } from './pages/intents/esctransaction/esctransaction.page';
import { CurrencySelectPage } from './pages/settings/currency-select/currency-select.page';
import { WalletColorPage } from './pages/wallet/wallet-color/wallet-color.page';
import { CoinAddERC20Page } from './pages/wallet/coin/coin-add-erc20/coin-add-erc20.page';
import { WalletAdvancedImportPage } from './pages/wallet/wallet-advanced-import/wallet-advanced-import.page';
import { SelectSubwalletPage } from './pages/intents/select-subwallet/select-subwallet.page';

/****************** Components ******************/
import { WalletCreatedComponent } from './components/wallet-created/wallet-created.component';
import { TxConfirmComponent } from './components/tx-confirm/tx-confirm.component';
import { TxSuccessComponent } from './components/tx-success/tx-success.component';
import { HelpComponent } from './components/help/help.component';
import { ContactsComponent } from './components/contacts/contacts.component';
import { CoinErc20DetailsPage } from './pages/wallet/coin/coin-erc20-details/coin-erc20-details.page';

Sentry.init({
  dsn: "https://b58a6612e1554e6fbeab3b24d980fead@sentry.io/1875741",
  release: "default",
  integrations: [
    new RewriteFrames(),
  ]
});

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  constructor(public alertCtrl: AlertController, public translate: TranslateService) {}

  handleError(error) {
    console.error("Globally catched exception:", error);

    console.log(document.URL);
    // Only send reports to sentry if we are not debugging.
    if (document.URL.includes('org.elastos.trinity.dapp.wallet')) { // Prod builds or --nodebug CLI builds use the app package id instead of a local IP
        /*const eventId = */ Sentry.captureException(error.originalError || error);
        //Sentry.showReportDialog({ eventId });
    }

    if (error.promise && error.promise.__zone_symbol__value && 'skipsentry' === error.promise.__zone_symbol__value.type) {
        // Do not popop error dialog, but still send to sentry for debug.
        console.log('This exception has been handled:', error);
    } else {
        // TODO: Build error if use this.popup, why?
        // this.popup.ionicAlert("Error", "Sorry, the application encountered an error. This has been reported to the team.", "Close");
        this.ionicAlert("Error", "Sorry, the application encountered an error. This has been reported to the team.", "Close");
    }
}

public ionicAlert(title: string, subTitle?: string, okText?: string): Promise<any> {
  return new Promise((resolve, reject) => {
      this.alertCtrl.create({
          header : this.translate.instant(title),
          subHeader: subTitle ? this.translate.instant(subTitle) : '',
          backdropDismiss: false,
          buttons: [{
              text: okText ? okText : this.translate.instant('confirm'),
              handler: () => {
                  resolve();
              }
          }]
      }).then(alert => alert.present());
  });
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
                case 'fr':
                    observer.next(fr);
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
        CRProposalVoteAgainstPage,
        DPoSVotePage,
        CoinTransferPage,
        DidTransactionPage,
        EscTransactionPage,
        WalletHomePage,
        SettingsPage,
        WalletManagerPage,
        WalletPasswordResetPage,
        WalletEditNamePage,
        WalletImportPage,
        WalletAdvancedImportPage,
        CoinHomePage,
        CoinAddressPage,
        CoinListPage,
        CoinSelectPage,
        CoinTxInfoPage,
        CoinReceivePage,
        CoinTransferPage,
        CoinAddERC20Page,
        CoinErc20DetailsPage,
        AboutPage,
        AccessPage,
        WalletCreateNamePage,
        CRMemberRegisterPage,
        WalletCreatePage,
        WaitForSyncPage,
        MnemonicWritePage,
        MnemonicExportPage,
        MnemonicWritePage,
        MnemonicCreatePage,
        CurrencySelectPage,
        WalletColorPage,
        SelectSubwalletPage,
        WalletCreatedComponent,
        TxConfirmComponent,
        TxSuccessComponent,
        HelpComponent,
        ContactsComponent,
        EmptyPage
    ],
    entryComponents: [
        EmptyPage,
        LauncherPage,
        WalletCreatedComponent,
        TxConfirmComponent,
        TxSuccessComponent,
        HelpComponent,
        ContactsComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        IonicModule.forRoot({
            mode: 'ios',
            scrollAssist: false,
            scrollPadding: false
        }),
        AppRoutingModule,
        IonicStorageModule,
        IonicImageLoaderModule,
        FormsModule,
        ComponentsModule,
        HttpClientModule,
        QRCodeModule,
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
        LocalStorage,
        Native,
        Logger,
        PopupProvider,
        WebView,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        { provide: ErrorHandler, useClass: SentryErrorHandler }
    ],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
