import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {Native} from "../../providers/Native";
import {WalletManager} from '../../providers/WalletManager';
import {Config} from '../../providers/Config';
@Component({
  selector: 'page-publickey',
  templateUrl: 'publickey.html',
})
export class PublickeyPage {
  public masterWalletId:string ="1";
  public qrcode: string=null;
  constructor(public navCtrl: NavController, public navParams: NavParams,public native: Native,public walletManager: WalletManager) {
        this.getPublicKey();
  }

  ionViewDidLoad() {

  }

  copy(){
    this.native.copyClipboard(this.qrcode);
    this.native.toast_trans('copy-ok');
  }

  getPublicKey(){
    this.masterWalletId = Config.getCurMasterWalletId();
    this.walletManager.getMasterWalletPublicKey(this.masterWalletId,(data)=>{
      if(data["success"]){
        this.qrcode = data["success"];
        this.native.info(data);
       }else{
        this.native.info(data);
       }
    });
  }

}
