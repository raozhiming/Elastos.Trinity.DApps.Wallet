import { Component} from '@angular/core';
import {IdKycCompanyComponent} from "../../../pages/id/kyc/company/company";
import {IDManager} from "../../../providers/IDManager";
import {ApiUrl} from "../../../providers/ApiUrl";
import {CompanyWriteChainPage} from "../../../pages/id/kyc/company-write-chain/company-write-chain";
import { NavController, NavParams,Events } from 'ionic-angular';
import {WalletManager} from '../../../providers/WalletManager';
import {Native} from "../../../providers/Native";
import {LocalStorage} from "../../../providers/Localstorage";
import {DataManager} from "../../../providers/DataManager";
@Component({
  selector: 'page-companypathinfo',
  templateUrl: 'companypathinfo.html',
})
export class CompanypathinfoPage{
       //public companyPathList = [{'pathStatus':4,payObj:{parms:{"word":"sss","legalPerson":"zzxxxxx","registrationNum":"ccccccccccc"}}}];
       public companyPathList = [];
       private parmar ={};
       public idsObj ={};
       constructor(public navCtrl: NavController,public navParams: NavParams,public native :Native,public walletManager :WalletManager,public localStorage: LocalStorage,public events: Events,public dataManager :DataManager){
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
             this.companyPathList.push(pathList[key]);
          }


        });
       }

      onNext(item){
          this.jumpPage(item);
      }

      onCommit(){
          this.native.Go(this.navCtrl,IdKycCompanyComponent,this.parmar);
      }

      jumpPage(item){
          switch(item["pathStatus"]){
                case 0 :
                    break;
                case 1:
                   this.getAppAuth(item);
                    break;
                case 2 :
                this.native.Go(this.navCtrl,CompanyWriteChainPage,item);
                    break;
          }
      }

/*  authResult[data] 格式
  [{
    "type": "enterprise",
    "result": "success",
    "retdata": {
      "app": "b1c0b7028c8c4be3beafc4c4812ae92e",
      "signature": "04c7a7e1b062d4692172f8bf9cad0b54d99a780d88c674dece9956bead38c228b53ebdaeb7f2d10b2804f7dd18aa764dcf9a12f7e27ccc3b949965db93ffd46a",
      "RegistrationNum": "911101080804655794",
      "legalPerson": "詹克团",
      "word": "北京比特大陆科技有限公司",
      "authid": "12345678",
      "ts": "1535090480"
    },
    "message": "认证成功",
    "timestamp": "1535090608902",
    "resultSign": "304402204187f00b8217b9eaeaad4c7c25ab01479872467443c7a516c68b368d290767ea02205f4130cd5bb904a070978baf2141ecaafb72163b45c21dc64fc48d63ad3ab0c4"
  }]
  */
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
            this.native.info(authResult);
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
              this.native.info(authResult["data"].length);
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
            this.native.Go(this.navCtrl,CompanyWriteChainPage,item);
         });
      }
}
