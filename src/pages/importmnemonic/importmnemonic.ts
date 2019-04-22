import { Component,NgZone} from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {Util} from "../../providers/Util";
import {Native} from "../../providers/Native";
import {MpublickeyPage} from '../../pages/mpublickey/mpublickey';
/**
 * Generated class for the ImportmnemonicPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-importmnemonic',
  templateUrl: 'importmnemonic.html',
})
export class ImportmnemonicPage {
  public showAdvOpts:boolean;
  public mnemonicObj:any={mnemonic:"",payPassword: "", rePayPassword: "",phrasePassword:"",name:"",singleAddress:true};
  public exatParm:any;
  constructor(public navCtrl: NavController, public navParams: NavParams,public native:Native,public zone:NgZone) {
         this.exatParm = this.navParams.data;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ImportmnemonicPage');
  }

  checkWorld(){
    if(Util.isNull(this.mnemonicObj.name)){
        //this.native.hideLoading();
        this.native.toast_trans("text-wallet-name-validator");
        return false;
    }

    if(Util.isWalletName(this.mnemonicObj.name)){
      this.native.toast_trans("text-wallet-name-validator1");
      return;
    }

    if(Util.isWallNameExit(this.mnemonicObj.name)){
      this.native.toast_trans("text-wallet-name-validator2");
      return;
    }


    if(Util.isNull(this.mnemonicObj.mnemonic)){
      //this.native.hideLoading();
        this.native.toast_trans('text-input-mnemonic');
        return false;
    }

    let mnemonic = this.normalizeMnemonic(this.mnemonicObj.mnemonic).replace(/^\s+|\s+$/g,"");
    if(mnemonic.split(/[\u3000\s]+/).length != 12){
      //this.native.hideLoading();
      this.native.toast_trans('text-mnemonic-validator');
      return false;
    }

    if(Util.isNull(this.mnemonicObj.payPassword)){
      //this.native.hideLoading();
      this.native.toast_trans('text-pay-password');
      return false;
    }
    if (!Util.password(this.mnemonicObj.payPassword)) {
      //this.native.hideLoading();
      this.native.toast_trans("text-pwd-validator");
      return false;
    }
    if(this.mnemonicObj.payPassword!=this.mnemonicObj.rePayPassword){
      //this.native.hideLoading();
      this.native.toast_trans('text-passworld-compare');
      return false;
    }
    return true;
  }

  private normalizeMnemonic(words: string): string {
    if (!words || !words.indexOf) return words;
    let isJA = words.indexOf('\u3000') > -1;
    let wordList = words.split(/[\u3000\s]+/);

    return wordList.join(isJA ? '\u3000' : ' ');
  };

  nextPage(){
     if(this.checkWorld()){

         this.exatParm["mnemonicStr"] = this.normalizeMnemonic(this.mnemonicObj.mnemonic);
         this.exatParm["mnemonicPassword"] = this.mnemonicObj.phrasePassword;
         this.exatParm["payPassword"] = this.mnemonicObj.payPassword;
         this.exatParm["name"] = this.mnemonicObj.name;
         this.native.Go(this.navCtrl,MpublickeyPage,this.exatParm);
     }
  }

  public toggleShowAdvOpts(): void {
    this.zone.run(()=>{
      this.showAdvOpts = !this.showAdvOpts;
    });
  }

}
