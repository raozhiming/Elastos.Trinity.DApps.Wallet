import {Component} from '@angular/core';
import {RechargeComponent} from "../recharge/recharge.component";
import {Config} from "../../../providers/Config";
import {Util} from "../../../providers/Util";
import { NavController, NavParams} from 'ionic-angular';
import {Native} from "../../../providers/Native";
@Component({
  selector: 'app-coin-slect',
  templateUrl: './coin-select.component.html'
})
export class CoinSelectComponent{
  public isNoData:boolean = false;
  coinList = [];
  masterWalletInfo = {};
  constructor(public navCtrl: NavController,public navParams: NavParams,public native :Native){
         this.init();
  }
  init() {
    this.masterWalletInfo = this.navParams.get("walletInfo");
    let mastId = Config.getCurMasterWalletId();
    let subwallet = Config.getSubWallet(mastId);
    if(subwallet){
      if(Util.isEmptyObject(subwallet)){
        this.coinList = [];
        this.isNoData = true;
        return;
      }
      this.isNoData = false;
      for (let coin in subwallet) {
        if (coin != 'ELA') {
          this.coinList.push({name: coin});
        }
      }
    }else{
      this.isNoData = true;
      this.coinList = [];
    }
  }

  onItem(item) {
    this.native.Go(this.navCtrl,RechargeComponent, {chianId: item.name,"walletInfo":this.masterWalletInfo});
  }

}
