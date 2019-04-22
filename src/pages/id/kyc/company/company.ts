import {Component} from '@angular/core';
import {ApiUrl} from "../../../../providers/ApiUrl";
import {IDManager} from "../../../../providers/IDManager";
import {TransferComponent} from "../../../../pages/coin/transfer/transfer.component";
import { NavController, NavParams,Events } from 'ionic-angular';
import {WalletManager} from '../../../../providers/WalletManager';
import {Native} from "../../../../providers/Native";
import {LocalStorage} from "../../../../providers/Localstorage";
import {DataManager} from "../../../../providers/DataManager";
import { Util } from '../../../../providers/Util';
@Component({
  selector: 'id-company',
  templateUrl: 'company.html',
})
export class IdKycCompanyComponent{
  businessObj={
              "type":"enterprise",
              "word":"北京比特大陆科技有限公司",
              "legalPerson":"詹克团",
              "registrationNum":"911101080804655794"
              };
  priceObj:any={};
  payMoney:number = 0;
  unit:string ="ELA";
  serialNum:string;
  parms:any;
  did:any;
  path:string = "";
  constructor(public navCtrl: NavController,public navParams: NavParams,public native :Native,public walletManager :WalletManager,public localStorage: LocalStorage,public events: Events,public dataManager :DataManager){
    this.init();
  }
  init() {

    this.parms = this.navParams.data;
    this.did = this.parms["id"];
    this.path = this.parms["path"] || "";
    this.getPrice();
  }

  onCommit(): void {
    if(this.checkParms()){
      this.businessObj["serialNum"] = this.serialNum;
       this.saveKycSerialNum(this.serialNum);
    }
  }

  saveKycSerialNum(serialNum){
    this.localStorage.get("kycId").then((val)=>{
        let idsObj = JSON.parse(val);
        let order = idsObj[this.did][this.path];
        order[serialNum] = {serialNum:serialNum,pathStatus:0,payObj:{did:this.did,addr:"EKZCcfqBP1YXiDtJVNdnLQR74QRHKrgFYD",money:this.payMoney,appType:"kyc",chianId:"ELA",selectType:this.path,parms:this.businessObj}};
        this.localStorage.set("kycId",idsObj).then((newVal)=>{
          this.native.Go(this.navCtrl,TransferComponent,{did:this.did,addr:"EKZCcfqBP1YXiDtJVNdnLQR74QRHKrgFYD",money:this.payMoney,appType:"kyc",chianId:"ELA",selectType:this.path,parms:this.businessObj});
        });
    })
}

  checkParms(): boolean{
     if(Util.isNull(this.businessObj.word)){
         this.native.toast_trans('text-word-message');
         return false;
     }

     if(Util.isNull(this.businessObj.legalPerson)){
      this.native.toast_trans('text-legalPerson-message');
      return false;
     }

     if(Util.isNull(this.businessObj.registrationNum)){
      this.native.toast_trans('text-registrationN-message');
      return false;
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
