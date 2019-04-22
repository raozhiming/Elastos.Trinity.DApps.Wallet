import { Component,ViewChild,NgZone} from '@angular/core';
import {ManagerComponent} from "../../wallet/manager/manager.component";
import {ContactListComponent} from "../../contacts/contact-list/contact-list.component";
import {IdLauncherComponent} from "../../id/launcher/launcher";
import {IdHomeComponent} from "../../id/home/home";
import {PublickeyPage} from '../../../pages/publickey/publickey';
import { Config } from '../../../providers/Config';
import { NavController, NavParams,Events,Navbar } from 'ionic-angular';
import {WalletManager} from '../../../providers/WalletManager';
import {Native} from "../../../providers/Native";
import {LocalStorage} from "../../../providers/Localstorage";
import { Util } from '../../../providers/Util';
import {LanguagePage} from '../../../pages/wallet/language/language';
import {ScanPage} from '../../../pages/scan/scan';
import { PopupProvider } from '../../../providers/popup';
import {ScancodePage} from '../../../pages/scancode/scancode';
import {ApiUrl} from "../../../providers/ApiUrl";
@Component({
  selector: 'app-my',
  templateUrl: 'my.component.html',
})
export class MyComponent{
  @ViewChild(Navbar) navBar: Navbar;
  public masterWalletId:string = "1";
  public masterWalletType:string = "";
  public readonly:string="";
  public currentLanguageName:string = "";
  public isShowDeposit:boolean = false;
  public fee:number = 0;
  public feePerKb:number = 10000;
  public walletInfo = {};
  public passworld:string = "";
  public available = 0;
  constructor(public navCtrl: NavController,public navParams: NavParams, public walletManager: WalletManager,public events :Events,public native :Native,public localStorage:LocalStorage,public popupProvider:PopupProvider,public zone :NgZone){
       //this.init();
  }

  ionViewWillEnter(){
       this.init();
  }

  init() {
    this.localStorage.getLanguage("wallte-language").then((val)=>{
      this.currentLanguageName = JSON.parse(val)["name"] || "";
      let lang=  JSON.parse(val)["isoCode"] || "";
      if(lang == 'en'){
        this.native.setMnemonicLang("english");
      }else if(lang == "zh"){
       this.native.setMnemonicLang("chinese");
      }else{
       this.native.setMnemonicLang("english");
      }
    });

    this.events.subscribe('language:update', (item) => {
     this.currentLanguageName = item["name"] || "";
     let lang=  item["isoCode"] || "";
     if(lang == 'en'){
       this.native.setMnemonicLang("english");
     }else if(lang == "zh"){
      this.native.setMnemonicLang("chinese");
     }else{
      this.native.setMnemonicLang("english");
     }
    });

    this.events.subscribe("wallte:update",(item)=>{
          this.masterWalletId = item;
          this.getMasterWalletBasicInfo();
    });
    this.masterWalletId = Config.getCurMasterWalletId();
    this.getAllMyTransaction();
    this.getMasterWalletBasicInfo();
  }

  getMasterWalletBasicInfo(){
    this.walletManager.getMasterWalletBasicInfo(this.masterWalletId,(data)=>{
      if(data["success"]){
         this.native.info(data);
         let item = JSON.parse(data["success"])["Account"];
         this.walletInfo = item;
         this.zone.run(()=>{
          this.masterWalletType = item["Type"];
          this.readonly = item["InnerType"] || "";
         });

      }else{
         this.native.info(data);
      }
    });
  }

  onNext(type): void {
     switch (type){
       case 0:
         this.native.Go(this.navCtrl,ManagerComponent);
         break;
       case 1:
       this.native.Go(this.navCtrl,PublickeyPage);
         break;
       case 2:
        this.native.Go(this.navCtrl,ContactListComponent);
         break;
       case 3:
         this.sendTX1();
         break;
       case 4:
         this.singTx1();
         break;
       case 6:
          this.getDIDList();
         break;
        case 5:
         this.setLanguage();
         break;
        case 7:
           this.getVoteNode();
           break;
        case 8:
           this.native.Go(this.navCtrl,'AboutPage');
          break;
        case 9:
           this.getPublicKeyForVote();
         break;
     }
   }

   getDIDList(){
    this.localStorage.get("kycId").then((val)=>{
      if(Util.isNull(val)){
        this.native.Go(this.navCtrl,IdLauncherComponent);
          return;
      }
      this.native.Go(this.navCtrl,IdHomeComponent);
    });
   }

   singTx1(){
    this.native.Go(this.navCtrl,ScanPage,{"pageType":"3"});
   }

   sendTX1(){
      this.native.Go(this.navCtrl,ScanPage,{"pageType":"4"});
   }

   ionViewDidLeave() {
    this.events.unsubscribe("wallte:update");
   }

   setLanguage(){
    this.localStorage.getLanguage("wallte-language").then((val)=>{
      let item =JSON.parse(val);
      this.native.Go(this.navCtrl,LanguagePage,item);
     });
   }

   getVoteNode(){
      this.getRegisteredProducerInfo();
   }

   getRegisteredProducerInfo(){
      this.walletManager.getRegisteredProducerInfo(this.masterWalletId,"ELA",(data)=>{
                  this.native.info(data);
                  if(data["success"]){
                    this.native.info(data);
                    let parms= JSON.parse((data["success"]));
                    this.native.Go(this.navCtrl,'SuperpointPage',parms);
                  }
      });
   }

   createRetrieveDepositTransaction(){
     let amount = Config.accMul(this.available,Config.SELA) - 10000;
     this.walletManager.createRetrieveDepositTransaction(this.masterWalletId,"ELA",amount,"","",(data)=>{
            this.native.info(data);
            let raw = data['success'];
            this.getFee(raw);
     });
   }


   getAllMyTransaction(){
     this.walletManager.getAllMyTransaction(this.masterWalletId,"ELA",0,"",(data)=>{
               this.native.info(data);
               if(data["success"]){
                let transactions = JSON.parse(data["success"])["Transactions"] || [];
                let item = this.getBackDeposit(transactions);
                if(item != -1){
                   let type = item['Type'];
                   let height = item['Height'];
                   let confirms = parseInt(item['ConfirmStatus'].substring(0,1));
                   this.native.info(confirms);
                   let jianju = Config.getEstimatedHeight(this.masterWalletId,"ELA") - height;
                   this.native.info(jianju);
                   if(type === 10 && confirms>1 && jianju>=2160){
                    this.zone.run(()=>{
                      this.isShowDeposit = true;
                    });
                   }else{
                    this.zone.run(()=>{
                           this.isShowDeposit = false;
                          });
                   }
                }else{
                  this.zone.run(()=>{
                  this.isShowDeposit = false;
                  });
                }
               }
     });
   }


getBackDeposit(list){
       for(let index = 0; index<list.length;index++){
             let item = list[index];
               if(item["Type"] === 12){
                  return item;
               }
               if(item["Type"] === 10){
                  return item;
               }
        }

        return -1;
 }



 //计算手续费
 getFee(rawTransaction){
  this.walletManager.calculateTransactionFee(this.masterWalletId,"ELA",rawTransaction, this.feePerKb, (data) => {
    if(data['success']){
      this.native.hideLoading();
      this.native.info(data);
      this.fee = data['success'];
      this.popupProvider.presentConfirm1(this.fee/Config.SELA).then(()=>{
              this.native.showLoading().then(()=>{
                this.updateTxFee(rawTransaction);
              });

      });
    }
  });
 }


 updateTxFee(rawTransaction){

  this.walletManager.updateTransactionFee(this.masterWalletId,"ELA",rawTransaction, this.fee,"",(data)=>{
    if(data["success"]){
     this.native.info(data);
     if(this.walletInfo["Type"] === "Multi-Sign" && this.walletInfo["InnerType"] === "Readonly"){
              this.readWallet(data["success"]);
              return;
     }
     this.singTx(data["success"]);
    }else{
     this.native.info(data);
    }
});
 }


 singTx(rawTransaction){
  this.walletManager.signTransaction(this.masterWalletId,"ELA",rawTransaction,this.passworld,(data)=>{
    if(data["success"]){
      this.native.info(data);
      if(this.walletInfo["Type"] === "Standard"){
           this.sendTx(data["success"]);
      }else if(this.walletInfo["Type"] === "Multi-Sign"){
          this.walletManager.encodeTransactionToString(data["success"],(raw)=>{
                   if(raw["success"]){
                    this.native.hideLoading();
                    this.native.Go(this.navCtrl,ScancodePage,{"tx":{"chianId":"ELA","fee":this.fee/Config.SELA, "raw":raw["success"]}});
                   }else{
                    this.native.info(raw);
                   }
          });
      }
     }else{
         this.native.info(data);
     }
  });
 }

 sendTx(rawTransaction){
  this.native.info(rawTransaction);
  this.walletManager.publishTransaction(this.masterWalletId,"ELA",rawTransaction,(data)=>{
    if(data['success']){
      this.native.hideLoading();
      this.native.toast_trans('send-raw-transaction');
    }else{
      this.native.info(data);
    }
  });
 }

 readWallet(raws){
  this.walletManager.encodeTransactionToString(raws,(raw)=>{
    if(raw["success"]){
      this.native.hideLoading();
      this.native.Go(this.navCtrl,ScancodePage,{"tx":{"chianId":"ELA","fee":this.fee/Config.SELA, "raw":raw["success"]}});
    }
});
}

getdepositcoin(ownerpublickey){
  let parms ={"ownerpublickey":ownerpublickey};
  this.native.getHttp().postByAuth(ApiUrl.getdepositcoin,parms).toPromise().then(data=>{
         if(data["status"] === 200){
             //this.native.info(data);
             let votesResult = JSON.parse(data["_body"]);
             this.native.info(votesResult);
             if(votesResult["code"] === "0"){
              //this.native.info(votesResult);
              this.available = votesResult["data"]["result"]["available"];
              //this.native.info(this.available);
              this.getBackDepositcoin();
             }
           }
  });
}

getPublicKeyForVote(){
  this.walletManager.getPublicKeyForVote(this.masterWalletId,"ELA",(data)=>{
            this.native.info(data);
            if(data["success"]){
              let publickey = data["success"];
              this.native.info(publickey);
              this.getdepositcoin(publickey);
            }
  });
}


getBackDepositcoin(){
  this.popupProvider.presentPrompt().then((val)=>{
    if(Util.isNull(val)){
      this.native.toast_trans("text-id-kyc-prompt-password");
      return;
    }
    this.passworld = val.toString();
    this.native.showLoading().then(()=>{
       this.createRetrieveDepositTransaction();
    });

    //this.native.Go(this.navCtrl,'JoinvotelistPage');
}).catch(()=>{

});
}



}
