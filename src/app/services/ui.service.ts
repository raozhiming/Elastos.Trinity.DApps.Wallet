import { Injectable } from '@angular/core';
import { SubWallet } from '../model/SubWallet';
import { StandardCoinName } from '../model/Coin';
import * as moment from 'moment';
import { PopoverController } from '@ionic/angular';
import { HelpComponent } from '../components/help/help.component';
import BigNumber from 'bignumber.js';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  constructor(
    private popoverCtrl: PopoverController
  ) { }

  getSubWalletIcon(subwallet: SubWallet): string {
    if (!subwallet)
      return "";

    switch (subwallet.id) {
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

  getSubwalletTitle(subwallet: SubWallet): string {
    if (!subwallet)
      return "";
    return subwallet.getFriendlyName();
  }

  getSubwalletSubtitle(subwallet: SubWallet): string {
    if (!subwallet)
      return "";
    return subwallet.getDisplayTokenName();
  }

  getFixedBalance(balance: BigNumber): string {
    if (balance.isZero()) {
        return String(0);
    } else {
        return balance.toFixed(4);
    }
  }

  getSyncDate(timestamp) {
    return moment(new Date(timestamp)).format();
  }

  public async showHelp(ev: any, helpMessage: string) {
    const popover = await this.popoverCtrl.create({
      mode: 'ios',
      component: HelpComponent,
      cssClass: 'helpComponent',
      event: ev,
      componentProps: {
        message: helpMessage
      },
      translucent: false
    });
    return await popover.present();
  }
}
