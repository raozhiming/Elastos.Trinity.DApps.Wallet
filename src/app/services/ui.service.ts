import { Injectable } from '@angular/core';
import { SubWallet } from '../model/wallets/SubWallet';
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

  /**
   * Returns a string representation of an asset value, with user friendly rounding to avoid long
   * numbers with many decimals.
   */
  getFixedBalance(balance: BigNumber): string {
    try {
        // let balance = new BigNumber("172400");
        if (balance.isZero()) {
          return String(0);
        } else if (balance.isLessThan(100)) {
            return balance.decimalPlaces(6).toString();
        } else if (balance.isGreaterThanOrEqualTo(100) && balance.isLessThan(1000)) {
          return balance.decimalPlaces(4).toString();
        } else if (balance.isGreaterThanOrEqualTo(1000) && balance.isLessThan(10000)) {
          return balance.decimalPlaces(2).toString();
        } else {
          return balance.dividedBy(1000).toFixed(0) + 'k';
        }
    } catch (e) {
        // The old wallet use number for balance, and save the wallet info to localstorage.
        // So the balance form localstorage maybe isn't bigNumber.
        return String(0);
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
