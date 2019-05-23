import { Component, OnInit } from '@angular/core';
import { Config } from "../../../services/Config";
import { Util } from "../../../services/Util";
import { NavController } from '@ionic/angular';
import { Native } from '../../../services/Native';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-coin-select',
  templateUrl: './coin-select.page.html',
  styleUrls: ['./coin-select.page.scss'],
})
export class CoinSelectPage implements OnInit {

  public isNoData:boolean = false;
  coinList = [];
  masterWalletInfo = {};
  constructor(public navCtrl: NavController, public route:ActivatedRoute, public native :Native){
    this.init();
  }

  ngOnInit() {
  }

  init() {
    this.route.queryParams.subscribe((data)=>{
      this.masterWalletInfo = data["walletInfo"];
    });
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
    this.native.Go(this.navCtrl,"/recharge", {chianId: item.name,"walletInfo":this.masterWalletInfo});
  }

}

