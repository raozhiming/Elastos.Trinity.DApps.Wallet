import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WalletTabsRootPage } from './wallet-tabs-root.page';
import { WalletTabSettingsPage } from '../wallet-tab-settings/wallet-tab-settings.page';

const routes: Routes = [
  {
    path: 'wallet-home',
    component: WalletTabsRootPage,
    children: [
      {
        path: 'wallet-tab-home',
        children: [
          {
            path: '',
            component: WalletTabsRootPage
          }
        ]
      },
      {
        path: 'wallet-tab-setting',
        children: [
          {
            path: '',
            component: WalletTabSettingsPage
          }
        ]
      },
      {
        path: '',
        redirectTo: '/wallet-home/wallet-tab-home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/wallet-home/wallet-tab-home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class WalletTabsRootRoutingModule {}
