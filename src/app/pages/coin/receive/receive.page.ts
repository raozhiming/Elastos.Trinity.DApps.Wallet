import { Component, OnInit } from '@angular/core';
import { Util } from "../../../services/Util";
import { Config } from '../../../services/Config';
import { NavController} from '@ionic/angular';
import { WalletManager } from '../../../services/WalletManager';
import { Native } from '../../../services/Native';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-receive',
  templateUrl: './receive.page.html',
  styleUrls: ['./receive.page.scss'],
})
export class ReceivePage implements OnInit {

  masterWalletId:string ="1";
  qrcode: string=null;
  address: Number;
  amount: Number;
  chinaId: string;
  constructor(public navCtrl: NavController, public route: ActivatedRoute, public walletManager: WalletManager,public native :Native){
    this.init();
  }

  ngOnInit() {
  }

  init() {
    this.masterWalletId =Config.getCurMasterWalletId();
    this.route.queryParams.subscribe((data)=>{
      this.chinaId = data["chianId"];
    });
    
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
        this.native.Go(this.navCtrl, "/address", {chinaId: this.chinaId});
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
