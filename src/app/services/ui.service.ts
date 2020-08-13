import { Injectable } from '@angular/core';
import { SubWallet } from '../model/SubWallet';
import { StandardCoinName } from '../model/Coin';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  constructor() { }

  getSubWalletIcon(subwallet: SubWallet): string {
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
    switch (subwallet.id) {
        case 'ELA':
            return 'Elastos';
        case 'IDChain':
            return 'Elastos DID';
        case 'ETHSC':
            return 'Elastos ETH';
        case 'ERC20':
            return subwallet.id;
    }
  }

  getSubwalletSubtitle(subwallet: SubWallet): string {
    switch (subwallet.id) {
        case 'ELA':
            return subwallet.id;
        case 'IDChain':
            return 'ELA/ID';
        case 'ETHSC':
            return 'ELA/ETHSC';
        case 'ERC20':
            return 'ERC20 Token';
    }
  }

}
