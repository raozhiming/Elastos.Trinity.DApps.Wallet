import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {ImportprivatekeyPage} from '../../pages/importprivatekey/importprivatekey';
import {WalletCreateComponent} from '../../pages/wallet/wallet-create/wallet-create.component';
import {CreatewalletnamePage} from "../../pages/createwalletname/createwalletname";
import {ImportmnemonicPage} from '../../pages/importmnemonic/importmnemonic';
import {Native} from "../../providers/Native";
@Component({
  selector: 'page-walltemode',
  templateUrl: 'walltemode.html',
})
export class WalltemodePage {
  public navObj:any;
  public totalCopayers:number;
  constructor(public navCtrl: NavController, public navParams: NavParams,public native: Native) {
     this.native.info(this.navParams.data);
     this.navObj = this.navParams.data;
     this.totalCopayers = this.navParams.data["totalCopayers"];
  }

  ionViewDidLoad() {

  }

  wayOne(){
    //this.navCtrl.push(WalletCreateComponent,this.navObj);
     //this.navCtrl.push(AddpublickeyPage,this.navObj);
     this.native.Go(this.navCtrl,WalletCreateComponent,this.navObj);
  }

  wayTwo(){
     //this.navCtrl.push(ImportprivatekeyPage,this.navObj);
     this.native.Go(this.navCtrl,ImportprivatekeyPage,this.navObj);
  }

  wayThree(){
    //this.navCtrl.push(AddpublickeyPage,this.navObj);
    this.native.Go(this.navCtrl,CreatewalletnamePage,this.navObj);
  }

  wayFour(){
    this.native.Go(this.navCtrl,ImportmnemonicPage,this.navObj);
  }

}
