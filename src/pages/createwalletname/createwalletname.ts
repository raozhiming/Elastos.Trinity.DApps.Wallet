import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {Native} from "../../providers/Native";
import {AddpublickeyPage} from '../../pages/addpublickey/addpublickey';
import {Util} from "../../providers/Util";
@Component({
  selector: 'page-createwalletname',
  templateUrl: 'createwalletname.html',
})
export class CreatewalletnamePage {
  public navObj:any;
  public name:string = "";
  constructor(public navCtrl: NavController, public navParams: NavParams,public native: Native) {
    this.navObj = this.navParams.data;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreatewalletnamePage');
  }

  import(){
    if(this.checkParms()){
      this.navObj["name"] = this.name;
      this.native.Go(this.navCtrl,AddpublickeyPage,this.navObj);
    }
  }

  checkParms(){
    if (Util.isNull(this.name)) {
      this.native.toast_trans("text-wallet-name-validator");
      return false;
    }

    if(Util.isWalletName(this.name)){
      this.native.toast_trans("text-wallet-name-validator1");
      return;
    }

    if(Util.isWallNameExit(this.name)){
      this.native.toast_trans("text-wallet-name-validator2");
      return;
    }

    return true;
  }

}
