import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Native } from '../../services/Native';
import { WalletManager } from '../../services/WalletManager';
import { Config } from '../../services/Config';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-publickey',
  templateUrl: './publickey.page.html',
  styleUrls: ['./publickey.page.scss'],
})
export class PublickeyPage implements OnInit {
  public masterWalletId:string ="1";
  public qrcode: string=null;
  constructor(public navCtrl: NavController, public route: ActivatedRoute, public native: Native,public walletManager: WalletManager) {
    this.getPublicKey();
  }

  ngOnInit() {
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
