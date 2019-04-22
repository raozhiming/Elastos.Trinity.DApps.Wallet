import {Component,NgZone} from '@angular/core';
import { NavController,NavParams} from 'ionic-angular';
import {Util} from "../../../providers/Util";
import {MnemonicComponent} from "../../mnemonic/mnemonic.component";
import {Native} from "../../../providers/Native";
@Component({
  selector: 'app-wallet-create',
  templateUrl: './wallet-create.component.html',
})
export class WalletCreateComponent {
 MultObj:any;
 isShow:any = false;
 constructor(public navCtrl: NavController,public navParams:NavParams,public native:Native,public zone:NgZone){
      this.MultObj = this.navParams.data;
      this.native.info(this.MultObj);
      if(!Util.isEmptyObject(this.MultObj)){
          this.wallet.singleAddress = true;
          this.isShow = true;
      }
 }
  wallet = {
    name: '',
    singleAddress: false,
    payPassword:'' ,//houpeitest
    rePayPassword:''//houpeitest
  };

  updateSingleAddress(isShow){
    this.zone.run(()=>{
      this.wallet.singleAddress = isShow;
    });
  }


  onCreate() {

    if (Util.isNull(this.wallet.name)) {
      this.native.toast_trans("text-wallet-name-validator");
      return;
    }

    if(Util.isWalletName(this.wallet.name)){
       this.native.toast_trans("text-wallet-name-validator1");
       return;
    }

    if(Util.isWallNameExit(this.wallet.name)){
      this.native.toast_trans("text-wallet-name-validator2");
      return;
    }

    if (!Util.password(this.wallet.payPassword)) {
      this.native.toast_trans("text-pwd-validator");
      return;
    }
    if (this.wallet.payPassword != this.wallet.rePayPassword) {
      this.native.toast_trans("text-repwd-validator");
      return;
    }
    this.createWallet();
  }

  createWallet(){
    // Master Wallet
    this.native.Go(this.navCtrl,MnemonicComponent, {payPassword: this.wallet.payPassword, name: this.wallet.name, singleAddress: this.wallet.singleAddress,mult:this.MultObj});
  }
}
