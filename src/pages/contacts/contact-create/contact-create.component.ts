import { Component} from '@angular/core';
import {Util} from "../../../providers/Util";
import { NavController, NavParams,Events} from 'ionic-angular';
import {WalletManager} from '../../../providers/WalletManager';
import {Native} from "../../../providers/Native";
import {LocalStorage} from "../../../providers/Localstorage";
@Component({
  selector: 'app-contact-create',
  templateUrl: './contact-create.component.html',
})
export class ContactCreateComponent{
  constructor(public navCtrl: NavController,public navParams: NavParams, public walletManager: WalletManager,public native: Native,public localStorage:LocalStorage,public events:Events) {

  }
  name: String;
  address: String;
  phone: String;
  email: String;
  remark: String;


  add(): void {
    let contactUsers = {
      id: this.name,
      name: this.name,
      address: this.address,
      phone: this.phone,
      email: this.email,
      remark: this.remark
    }
    if (Util.isNull(this.name)) {
      this.native.toast_trans("contact-name-notnull");
      return;
    }
    if (Util.isNull(this.address)) {
      this.native.toast_trans("contact-address-notnull");
      return;
    }
    if (!Util.isAddressValid(this.address)) {
      this.native.toast_trans("contact-address-digits");
      return;
    }
    if (this.phone && Util.checkCellphone(this.phone.toString())) {
         this.native.toast_trans("contact-phone-check");
      return;
    }
    this.localStorage.add('contactUsers', contactUsers).then((val)=>{
      this.events.publish("contanctList:update");
      this.navCtrl.pop();
    });
  }

}
