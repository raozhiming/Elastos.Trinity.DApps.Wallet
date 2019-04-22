import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {Native} from "../../providers/Native";
import {WalletManager} from '../../providers/WalletManager';
import {Config} from '../../providers/Config';
import {AddpublickeyPage} from '../../pages/addpublickey/addpublickey';
import {AddprivatekeyPage} from '../../pages/addprivatekey/addprivatekey';
@Component({
  selector: 'page-mpublickey',
  templateUrl: 'mpublickey.html',
})
export class MpublickeyPage {

  public masterWalletId:string ="1";
  public qrcode: string=null;
  exatParm:any;
  constructor(public navCtrl: NavController, public navParams: NavParams,public native: Native,public walletManager: WalletManager) {
        this.exatParm = this.navParams.data;
        this.native.info(this.exatParm);
        if(this.exatParm["mnemonicStr"]){
          this.getPublicKey();
        }else if(this.exatParm["importText"]){
          this.getMultiSignPubKeyWithPrivKey();
        }

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MpublickeyPage');
  }

  copy(){
    this.native.copyClipboard(this.qrcode);
    this.native.toast_trans('copy-ok');
  }

  getPublicKey(){

    this.walletManager.getMultiSignPubKeyWithMnemonic(this.exatParm["mnemonicStr"],this.exatParm["mnemonicPassword"],(data)=>{

      if(data["success"]){
        this.qrcode = data["success"];
       }else{
       }
    });
  }

  getMultiSignPubKeyWithPrivKey(){
    this.walletManager.getMultiSignPubKeyWithPrivKey(this.exatParm["importText"],(data)=>{
      if(data["success"]){
        this.qrcode = data["success"];
       }else{
       }
    });
  }

  nextPage(){
    if(this.exatParm["mnemonicStr"]){
      this.native.Go(this.navCtrl,AddpublickeyPage,this.exatParm);
    }else if(this.exatParm["importText"]){
      this.native.Go(this.navCtrl,AddprivatekeyPage,this.exatParm);
    }

  }

}
