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

import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes, NoPreloading } from '@angular/router';
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
import { WalletTabsRootPage } from './pages/wallet/wallet-home/wallet-tabs-root/wallet-tabs-root.page';
import { WalletTabSettingsPage } from './pages/wallet/wallet-home/wallet-tab-settings/wallet-tab-settings.page';
import { WalletTabHomePage } from './pages/wallet/wallet-home/wallet-tab-home/wallet-tab-home.page';
import { WalletManager } from './services/wallet.service';
import { WalletManagerPage } from './pages/wallet/wallet-manager/wallet-manager.page';

const routes: Routes = [
    // Global
    { path: 'launcher', component: LauncherPage },
    { path: 'about', component: AboutPage },

    // Wallet
    {
        path: 'wallet-home',
        component: WalletTabsRootPage,
        children: [
            {
                path: 'wallet-tab-home',
                component: WalletTabHomePage
            },
            {
                path: 'wallet-tab-settings',
                component: WalletTabSettingsPage
            }
        ]
    },
    { path: 'wallet-create', component: WalletCreatePage },
    { path: 'wallet-import', component: WalletImportPage },
    { path: 'wallet-manager', component: WalletManagerPage },
    { path: 'mnemonic-create', component: MnemonicCreatePage },
    { path: 'wallet-create-name', component: WalletCreateNamePage },
    { path: 'scancode', component: ScanCodePage },
    { path: 'mnemonic-write', component: MnemonicWritePage },
    { path: 'wallet-list', component: WalletlistPage },
    { path: 'wallet-password-reset', component: WalletPasswordResetPage },
    { path: 'wallet-edit-name', component: WalletEditNamePage },
    { path: 'mnemonic-export', component: MnemonicExportPage },
    { path: 'mnemonic-check', component: MnemonicCheckPage },
    { path: 'wallet-settings', component: WalletSettingsPage },

    // Coin
    { path: 'coin/:name', component: CoinHomePage },
    { path: 'coin-list', component: CoinListPage },
    { path: 'coin-select', component: CoinSelectPage },
    { path: 'coin-receive', component: CoinReceivePage },
    { path: 'coin-tx-info', component: CoinTxInfoPage },
    { path: 'coin-transfer', component: CoinTransferPage },

    // Contacts
    { path: 'contacts', component: ContactsPage },
    { path: 'contact-list', component: ContactListPage },
    { path: 'contact-create', component: ContactCreatePage},

    // Intents
    { path: 'access', component: AccessPage },
    { path: 'didtransaction', component: DidTransactionPage },
    { path: 'waitforsync', component: WaitForSyncPage },
    { path: 'crmembervote', component: CRmembervotePage },
    { path: 'dposvote', component: DPoSVotePage },
    { path: 'crmemberregister', component: CRMemberRegisterPage },
];
@NgModule({
    imports: [
        RouterModule.forRoot(routes, { preloadingStrategy: NoPreloading })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
