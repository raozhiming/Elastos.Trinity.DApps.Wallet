import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Native } from '../../services/Native';
import { WalletManager } from '../../services/WalletManager';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-mpublickey',
  templateUrl: './mpublickey.page.html',
  styleUrls: ['./mpublickey.page.scss'],
})
export class MpublickeyPage implements OnInit {
  public masterWalletId:string ="1";
  public qrcode: string=null;
  exatParm:any;
  constructor(public navCtrl: NavController, public route: ActivatedRoute, public native: Native,public walletManager: WalletManager) { 
    this.route.queryParams.subscribe((data)=>{
      this.exatParm = data;
      this.native.info(this.exatParm);
      if(this.exatParm["mnemonicStr"]){
        this.getPublicKey();
      }else if(this.exatParm["importText"]){
        this.getMultiSignPubKeyWithPrivKey();
      }
    });
  }

  ngOnInit() {
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
      this.native.Go(this.navCtrl, "/addpublickey", this.exatParm);
    }else if(this.exatParm["importText"]){
      this.native.Go(this.navCtrl, "/addprivatekey", this.exatParm);
    }

  }
}


