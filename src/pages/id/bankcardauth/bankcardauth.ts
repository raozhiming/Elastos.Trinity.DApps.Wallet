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
  selector: 'page-bankcardauth',
  templateUrl: 'bankcardauth.html',
})
export class BankcardauthPage{
  debitCard={fullName:'宋家准',identityNumber:'410426198811151012',cardNumber:'6225880167820399',cardMobile:'18210230496',cardCode:'',type:"bankCard"};
  payMoney = 0;
  unit:string="ELA";
  priceObj:any={};
  parms:any;
  did:any;
  serialNum:string;
  path:string;
  verifyCode: any = {
    verifyCodeTips: "获取验证码",
    countdown:60,//总共时间
    disable:true
}
constructor(public navCtrl: NavController,public navParams: NavParams,public native :Native,public walletManager :WalletManager,public localStorage: LocalStorage,public events: Events,public dataManager :DataManager){
  this.init();
}
  init(){

    this.parms = this.navParams.data;
    this.did = this.parms["id"];
    this.path = this.parms["path"] || "";
    this.getPrice();
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

  sendCodeHttp(mobile){
    let code = (Math.random()*1000000000000000).toString().substring(0,6);
    let timestamp = this.native.getTimestamp();
    let parms ={"mobile":mobile,"code":code,"serialNum":this.serialNum,"timestamp":timestamp};
    let checksum = IDManager.getCheckSum(parms,"asc");
    parms["checksum"] = checksum;
    this.native.getHttp().postByAuth(ApiUrl.SEND_CODE,parms).toPromise().then(data=>{

    }).catch(error => {

    });
  }


    onCommit(){
      if(this.checkParms()){
        this.saveKycSerialNum(this.serialNum);
      }

   }

   saveKycSerialNum(serialNum){
     this.localStorage.get("kycId").then((val)=>{
         let idsObj = JSON.parse(val);
         let order = idsObj[this.did][this.path];
         order[serialNum] = {serialNum:serialNum,pathStatus:0,payObj:{did:this.did,addr:"EKZCcfqBP1YXiDtJVNdnLQR74QRHKrgFYD",money:this.payMoney,appType:"kyc",chianId:"ELA",selectType:this.path,parms:this.debitCard}};
         this.localStorage.set("kycId",idsObj).then((newVal)=>{
           this.debitCard["serialNum"] = serialNum;

           this.native.Go(this.navCtrl,TransferComponent,{did:this.did,addr:"EKZCcfqBP1YXiDtJVNdnLQR74QRHKrgFYD",money:this.payMoney,appType:"kyc",chianId:"ELA",selectType:this.path,parms:this.debitCard});
         });
     })
   }

   checkParms(){

    if(Util.isNull(this.debitCard.fullName)){
      this.native.toast_trans('text-realname-message');
       return;
}

if(Util.isNull(this.debitCard.identityNumber)){
  this.native.toast_trans('text-cardNo-message-1');
  return;
}

if(Util.isCardNo(this.debitCard.identityNumber)){
  this.native.toast_trans('text-cardNo-message-2');
  return;
}



    if(Util.isNull(this.debitCard.cardNumber)){
      this.native.toast_trans('text-debitCard-message-1');
       return;
     }

     if(Util.isBankCard(this.debitCard.cardNumber)){
      this.native.toast_trans('text-debitCard-message-2');
       return;
     }

    if(Util.isNull(this.debitCard.cardMobile)){
      this.native.toast_trans('text-phone-message-1');
           return;
    }

    if(Util.checkCellphone(this.debitCard.cardMobile)){
      this.native.toast_trans('text-phone-message-2');
      return;
    }

    if(Util.isNull(this.debitCard.cardCode)){
          this.native.toast_trans('text-sendcode-message-1');
      return;
     }

     return true;
   }

   getCode(phone){
    if(Util.isNull(phone)){
      this.native.toast_trans('text-phone-message-1');
       return;
    }

   if(Util.checkCellphone(phone)){
        this.native.toast_trans('text-phone-message-2');
      return;
    }
    if(this.verifyCode.disable){
      this.verifyCode.disable = false;
      this.settime();
      this.sendCodeHttp(phone);
    }
      }

      //倒计时
      settime() {
        if (this.verifyCode.countdown == 0)
            {
              this.verifyCode.verifyCodeTips = "获取验证码";
              this.verifyCode.disable = true;
              this.verifyCode.countdown = 60;
              return;
            } else {
               this.verifyCode.countdown--;
            }
            setTimeout(() => {
              this.verifyCode.verifyCodeTips = "重新获取" + this.verifyCode.countdown + "秒"; this.settime();
            }, 1000);
           }
}
