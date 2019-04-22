import {Component} from '@angular/core';
import {AddressComponent} from "../../wallet/address/address.component";
import {Util} from "../../../providers/Util";
import { Config } from '../../../providers/Config';
import { NavController, NavParams} from 'ionic-angular';
import {WalletManager} from '../../../providers/WalletManager';
import {Native} from "../../../providers/Native";
@Component({
  selector: 'app-receive',
  templateUrl: './receive.component.html'
})
export class ReceiveComponent{
  masterWalletId:string ="1";
  qrcode: string=null;
  address: Number;
  amount: Number;
  chinaId: string;
  constructor(public navCtrl: NavController,public navParams: NavParams, public walletManager: WalletManager,public native :Native){
        this.init();
  }
  init() {
    this.masterWalletId =Config.getCurMasterWalletId();
    this.chinaId = this.navParams.get("chianId");
    this.createAddress();
  }

  onChange(){
    if(!Util.number(this.amount)){
      this.native.toast_trans('correct-amount');
    }
  }


  onNext(type){
    switch (type){
      case 0:
        this.native.copyClipboard(this.qrcode);
        this.native.toast_trans('copy-ok');
        break;
      case 1:
        this.createAddress();
        break;
      case 2:
        this.native.Go(this.navCtrl,AddressComponent, {chinaId: this.chinaId});
        break;
    }
  }

  createAddress(){
    this.walletManager.createAddress(this.masterWalletId,this.chinaId, (data)=>{
        if(data["success"]){
          this.qrcode = data["success"];
          this.address = data["success"];
        }else{
           alert("===createAddress===error"+JSON.stringify(data));
        }
    });
  }

}
