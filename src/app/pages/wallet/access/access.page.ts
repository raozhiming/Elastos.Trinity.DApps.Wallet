import { Component, OnInit } from '@angular/core';
import { AppService } from '../../../services/AppService';
import { Config } from '../../../services/Config';
import { WalletManager } from '../../../services/WalletManager';
import { Native } from '../../../services/Native';
import { PopupProvider } from '../../../services/popup';

@Component({
  selector: 'app-access',
  templateUrl: './access.page.html',
  styleUrls: ['./access.page.scss'],
})
export class AccessPage implements OnInit {
  Config = Config;

  requestDapp: any = null;
  masterWalletId = "1";
  elaAddress: string = null;
  chainId = "ELA";
  requester = "";
  reason = "";

  constructor(public appService: AppService,
              public walletManager: WalletManager,
              public popupProvider: PopupProvider,
              public native: Native) {}

  ngOnInit() {
    this.init();
  }

  init() {
    this.requestDapp = Config.requestDapp;
    this.masterWalletId = Config.getCurMasterWalletId();
    this.createAddress();

    this.onShare();
  }

  // getAddress() {
  //   this.native.go("/address", { chainId: this.chainId });
  // }

  createAddress() {
    this.walletManager.createAddress(this.masterWalletId, this.chainId, (ret) => {
      this.elaAddress = ret;
    });
  }

  onShare() {
    this.popupProvider.ionicConfirm("confirmTitle", "text-share-address").then((data) => {
      if (data) {
        console.log('share the address');
        this.appService.sendIntentResponse(this.requestDapp.action, {walletinfo: [{elaaddress: this.elaAddress}]}, this.requestDapp.intentId);
        this.native.pop();
      }
  });
  }
}
