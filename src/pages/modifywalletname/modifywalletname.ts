import { Component } from '@angular/core';
import { NavController, NavParams,Events} from 'ionic-angular';
import {Util} from "../../providers/Util";
import {Config} from "../../providers/Config";
import {Native} from "../../providers/Native";
import {LocalStorage} from "../../providers/Localstorage";
@Component({
  selector: 'page-modifywalletname',
  templateUrl: 'modifywalletname.html',
})
export class ModifywalletnamePage {
  public walletname:string = "";
  public masterWalletId:string = "1";
  constructor(public navCtrl: NavController, public navParams: NavParams,public native: Native,public localStorage :LocalStorage,public events :Events) {
        this.masterWalletId = Config.getCurMasterWalletId();
        this.walletname =Config.getWalletName(this.masterWalletId);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ModifywalletnamePage');
  }

  modify(){
   if(Util.isNull(this.walletname)) {
      this.native.toast_trans("text-wallet-name-validator");
      return;
    }

    if(Util.isWalletName(this.walletname)){
      this.native.toast_trans("text-wallet-name-validator1");
      return;
   }

   if(Util.isWallNameExit(this.walletname)){
    this.native.toast_trans("text-wallet-name-validator2");
    return;
  }

     this.native.showLoading().then(()=>{
         this.modifyName();
     })

  }

  modifyName(){

    let walletObj = this.native.clone(Config.masterWallObj);
    walletObj["id"]   = this.masterWalletId;
    walletObj["Account"] = Config.getAccountType(this.masterWalletId);
    walletObj["wallname"] = this.walletname;
    let subWallte = Config.getSubWallet(this.masterWalletId);
    if(subWallte){
      walletObj["coinListCache"] = subWallte;
    }

    this.localStorage.saveMappingTable(walletObj).then((data)=>{
      let  mappingList = this.native.clone(Config.getMappingList());
      mappingList[this.masterWalletId] = walletObj;
      Config.setWalletName(this.masterWalletId,this.walletname);
      Config.setMappingList(mappingList);
      this.native.hideLoading();
      this.navCtrl.pop();
    });
  }



}
