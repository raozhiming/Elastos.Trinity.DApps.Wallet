import { Component} from '@angular/core';
import { NavController, NavParams} from 'ionic-angular';
import {WalletManager} from '../../../providers/WalletManager';
import {Util} from "../../../providers/Util";
import {Native} from "../../../providers/Native";
import {Config} from "../../../providers/Config";
@Component({
  selector: 'app-paypassword-reset',
  templateUrl: './paypassword-reset.component.html'
})
export class PaypasswordResetComponent {
  masterWalletId:string ="1";
  oldPayPassword: string;
  payPassword: string;
  rePayPassword: string;
  constructor(public navCtrl: NavController,public navParams: NavParams, public walletManager: WalletManager,public native: Native) {
        this.masterWalletId = Config.getCurMasterWalletId();
  }

  onSubmit() {
    if (!Util.password(this.payPassword)) {
      this.native.toast_trans("text-pwd-validator");
      return;
    }
    if (this.payPassword != this.rePayPassword) {
      this.native.toast_trans("text-repwd-validator");
      return;
    }
    // reset pay password
    this.walletManager.changePassword(this.masterWalletId,this.oldPayPassword, this.payPassword, (data)=>{
      if(data["success"]){
        this.native.info(data);
        this.native.toast_trans("reset-pwd-success");
        this.navCtrl.pop();
      }else{
        this.native.info(data);
      }

    });
  }

}
