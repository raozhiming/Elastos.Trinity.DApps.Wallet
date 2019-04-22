import { Component} from '@angular/core';
import {IdentityauthPage} from '../../../pages/id/identityauth/identityauth';
import {PersonWriteChainPage} from "../../../pages/id/kyc/person-write-chain/person-write-chain";
import {IDManager} from "../../../providers/IDManager";
import {ApiUrl} from "../../../providers/ApiUrl";
import { NavController, NavParams} from 'ionic-angular';
import {Native} from "../../../providers/Native";
import {LocalStorage} from "../../../providers/Localstorage";
import {DataManager} from "../../../providers/DataManager";
@Component({
  selector: 'page-identitypathinfo',
  templateUrl: 'identitypathinfo.html',
})
export class IdentitypathinfoPage{
  //public identitypathlist =[{'pathStatus':4,payObj:{parms:{"fullName":"sssssss","identityNumber":410426,"mobile":18210230496}}},{'pathStatus':5,payObj:{parms:{"fullName":"sssssss","identityNumber":410426,"mobile":18210230496}}},{'pathStatus':4,payObj:{parms:{"fullName":"sssssss","identityNumber":410426,"mobile":18210230496}}},{'pathStatus':4,payObj:{parms:{"fullName":"sssssss","identityNumber":410426,"mobile":18210230496}}}];
  public identitypathlist =[];
  private parmar ={};
  public idsObj ={};
  constructor(public navCtrl: NavController,public navParams: NavParams,public native :Native,public localStorage: LocalStorage,public dataManager :DataManager){
    this.init();
}
  init(){
   this.parmar = this.navParams.data;
   this.native.info(this.parmar);
   this.localStorage.get("kycId").then((val)=>{
    if(val == null || val === undefined || val === {} || val === ''){
      return;
     }
    this.idsObj = JSON.parse(val);

    let pathList = this.idsObj[this.parmar["id"]][this.parmar["path"]];

    for(let key in pathList){
       this.identitypathlist.push(pathList[key]);
    }


  });
  }

  onNext(item){
    this.jumpPage(item);
  }

  onCommit(){
    this.native.Go(this.navCtrl,IdentityauthPage,this.parmar);
  }

  jumpPage(item){
    switch(item["pathStatus"]){
          case 0 :
              break;
          case 1:
             this.getAppAuth(item);
              break;
          case 2 :
          this.native.Go(this.navCtrl,PersonWriteChainPage,item);
              break;
    }
}


getAppAuth(item){
  let serialNum = item["serialNum"];
  let txHash =  item["txHash"];
  this.native.info(typeof(txHash));
  this.native.info(serialNum);
  this.native.info(txHash);
  let timestamp = this.native.getTimestamp();
  let parms ={"serialNum":serialNum,
              "txHash":txHash,
              "timestamp":timestamp,
             }
  let checksum = IDManager.getCheckSum(parms,"asc");
  parms["checksum"] = checksum;
  this.native.getHttp().postByAuth(ApiUrl.APP_AUTH,parms).toPromise().then().then(data => {
    if(data["status"] === 200){
      this.native.info(data);
      let authResult = JSON.parse(data["_body"]);
      if(authResult["errorCode"] === "1"){
        this.native.toast_trans("text-id-kyc-auth-fee-fail");
        return;
      }
      if(authResult["errorCode"] === "2"){
        this.native.toast_trans("text-id-kyc-auth-query-timeout");
               return;
      }
      if(authResult["errorCode"] === "4"){
        this.native.toast_trans("text-id-kyc-auth-uncompleted");
             return;
      }
      if(authResult["errorCode"] === "0"){
          //this.params["adata"] = authResult["data"];
          item["adata"] = authResult["data"];
          this.saveSerialNumParm(serialNum,item);

        if (authResult["data"].length > 0){
          var signCont = JSON.parse(JSON.stringify(authResult["data"][0]));
          let resultSign = signCont["resultSign"];
          delete signCont["resultSign"];

          this.dataManager.addSignCont(resultSign, signCont);

        }
      }
     }
  }).catch(error => {

  });
}

saveSerialNumParm(serialNum,item){
   item["pathStatus"] = 2;
   this.idsObj[this.parmar["id"]][this.parmar["path"]][serialNum]= item;
   this.localStorage.set("kycId",this.idsObj).then(()=>{
      this.native.Go(this.navCtrl,PersonWriteChainPage,item);
   });
}

}
