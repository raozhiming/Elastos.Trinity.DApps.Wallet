import { Component} from '@angular/core';
import {IDManager} from "../../../providers/IDManager"
import {ApiUrl} from "../../../providers/ApiUrl"
import {TransferComponent} from "../../../pages/coin/transfer/transfer.component";
import { NavController, NavParams,Events } from 'ionic-angular';
import {WalletManager} from '../../../providers/WalletManager';
import {Native} from "../../../providers/Native";
import {LocalStorage} from "../../../providers/Localstorage";
import {DataManager} from "../../../providers/DataManager";
import { Util } from '../../../providers/Util';
@Component({
  selector: 'page-identityauth',
  templateUrl: 'identityauth.html',
})
export class IdentityauthPage{

  personValidate = {fullName:'宋家准',identityNumber:'410426198811151012',"type":"identityCard"};//个人验证对象
  payMoney = 0;
  unit:string="ELA"
  priceObj:any={};
  parms:any;
  did:any;
  serialNum:string;
  path:string;
  constructor(public navCtrl: NavController,public navParams: NavParams,public native :Native,public walletManager :WalletManager,public localStorage: LocalStorage,public events: Events,public dataManager :DataManager){
    this.init();
  }
  init(){
    this.parms = this.navParams.data;
    this.did = this.parms["id"];
    this.path = this.parms["path"] || "";
    this.getPrice();
  }

  onCommit(){
         if(this.checkIdentity()){
            this.saveKycSerialNum(this.serialNum);
         }
  }

  saveKycSerialNum(serialNum){
    this.localStorage.get("kycId").then((val)=>{
        let idsObj = JSON.parse(val);
        let order = idsObj[this.did][this.path];
        order[serialNum] = {serialNum:serialNum,pathStatus:0,payObj:{did:this.did,addr:"EKZCcfqBP1YXiDtJVNdnLQR74QRHKrgFYD",money:this.payMoney,appType:"kyc",chianId:"ELA",selectType:this.path,parms:this.personValidate}};
        this.localStorage.set("kycId",idsObj).then((newVal)=>{
          this.personValidate["serialNum"] = serialNum;
          this.native.Go(this.navCtrl,TransferComponent,{did:this.did,addr:"EKZCcfqBP1YXiDtJVNdnLQR74QRHKrgFYD",money:this.payMoney,appType:"kyc",chianId:"ELA",selectType:this.path,parms:this.personValidate});
        });
    })
}

  checkIdentity(){
    if(Util.isNull(this.personValidate.fullName)){
      this.native.toast_trans('text-realname-message');
       return;
     }

    if(Util.isNull(this.personValidate.identityNumber)){
      this.native.toast_trans('text-cardNo-message-1');
     return;
   }

   if(Util.isCardNo(this.personValidate.identityNumber)){
      this.native.toast_trans('text-cardNo-message-2');
       return;
    }

    return true;
  }

  getPrice(){
    let timestamp = this.native.getTimestamp();
    let parms ={"appid":"elastid","timestamp":timestamp};
    let checksum = IDManager.getCheckSum(parms,"asc");
    parms["checksum"] = checksum;
    this.native.getHttp().postByAuth(ApiUrl.GET_PRICE,parms).toPromise().then().then(data => {
        if(data["status"] === 200){
          this.priceObj = JSON.parse(data["_body"]);
          this.payMoney = this.priceObj["price"] || 0.1;
          this.unit = this.priceObj["unit"] || "ELA";
          this.serialNum = this.priceObj["serialNum"];
         }
    }).catch(error => {

    });
  }

}
