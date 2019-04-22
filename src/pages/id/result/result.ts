import { Component,ViewChild } from '@angular/core';
import {IdHomeComponent} from "../../../pages/id/home/home";
import {PathlistPage} from '../../../pages/id/pathlist/pathlist';
import { NavController, NavParams,Events,Navbar} from 'ionic-angular';
import {WalletManager} from '../../../providers/WalletManager';
import {Native} from "../../../providers/Native";
import {LocalStorage} from "../../../providers/Localstorage";
import {DataManager} from "../../../providers/DataManager";
import {Util} from "../../../providers/Util";
@Component({
  selector: 'id-kyc-result',
  templateUrl: './result.html',
})
export class IdResultComponent{
  @ViewChild(Navbar) navBar: Navbar;
  type: string;
  parms:any;
  constructor(public navCtrl: NavController,public navParams: NavParams,public native :Native,public walletManager :WalletManager,public localStorage: LocalStorage,public events: Events,public dataManager :DataManager){
    this.init();
}
  init() {
    this.parms = this.navParams.data;
    let status = this.parms["status"];
    if(Util.isNull(status)){
      this.type = '0';
    }else{
      this.type = status;
    }
  }


  ionViewDidLoad() {
    this.navBar.backButtonClick = (e)=>{
      this.native.setRootRouter(IdHomeComponent);
    };
  }

  check(){
     this.native.Go(this.navCtrl,PathlistPage,this.parms);
  }

}
