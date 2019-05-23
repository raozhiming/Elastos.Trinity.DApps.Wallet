import { Component, OnInit } from '@angular/core';
import { Util } from "../../../services/Util";
import { NavController, Events} from '@ionic/angular';
import { WalletManager } from '../../../services/WalletManager';
import { Native } from '../../../services/Native';
import { ActivatedRoute } from '@angular/router';
import { LocalStorage } from '../../../services/Localstorage';

@Component({
  selector: 'app-contact-create',
  templateUrl: './contact-create.page.html',
  styleUrls: ['./contact-create.page.scss'],
})
export class ContactCreatePage implements OnInit {
  name: String;
  address: String;
  phone: String;
  email: String;
  remark: String;

  constructor(public navCtrl: NavController, public route: ActivatedRoute, public walletManager: WalletManager,public native: Native,public localStorage:LocalStorage,public events:Events) {

  }

  ngOnInit() {
  }


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
