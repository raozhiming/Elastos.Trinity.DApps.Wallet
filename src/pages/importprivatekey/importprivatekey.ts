import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {Util} from "../../providers/Util";
import {Native} from "../../providers/Native";
import {MpublickeyPage} from '../../pages/mpublickey/mpublickey';
@Component({
  selector: 'page-importprivatekey',
  templateUrl: 'importprivatekey.html',
})
export class ImportprivatekeyPage {
  public msobj:any;
  public importText:string="";
  public passWord:string="";
  public rePassWorld:string="";
  public name:string ="";
  constructor(public navCtrl: NavController, public navParams: NavParams,public native:Native) {
    this.msobj = this.navParams.data;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ImportprivatekeyPage');
  }

  import(){

        if(this.checkParms()){
            this.msobj["importText"] = this.importText.replace(/^\s+|\s+$/g,"");
            this.msobj["passWord"] = this.passWord;
            this.msobj["name"] = this.name;
            //this.navCtrl.push(AddprivatekeyPage,this.msobj);
            this.navCtrl.push(MpublickeyPage,this.msobj);
        }
  }
  checkParms(){
    if (Util.isNull(this.name)) {
      this.native.toast_trans("text-wallet-name-validator");
      return;
    }

    if(Util.isWalletName(this.name)){
      this.native.toast_trans("text-wallet-name-validator1");
      return;
   }

   if(Util.isWallNameExit(this.name)){
    this.native.toast_trans("text-wallet-name-validator2");
    return;
  }

    if(Util.isNull(this.importText)){
      this.native.toast_trans('text-import-privatekey-placeholder');
      return false;
    }
    if(Util.isNull(this.passWord)){
      this.native.toast_trans('text-pay-password');
      return false;
    }

    if(this.passWord!=this.rePassWorld){
      this.native.toast_trans('text-passworld-compare');
      return false;
    }
    return true;
  }
}
