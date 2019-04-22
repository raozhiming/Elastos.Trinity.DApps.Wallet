import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Native} from "../../../../providers/Native";
import {PopupProvider} from "../../../../providers/popup";
import {Util} from '../../../../providers/Util';
import {  Config } from '../../../../providers/Config';
import {WalletManager} from '../../../../providers/WalletManager';
import {ScancodePage} from '../../../../pages/scancode/scancode';

/**
 * Generated class for the UpdateproducerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-updateproducer',
  templateUrl: 'updateproducer.html',
})
export class UpdateproducerPage {
  info ={};
  public passworld:string = "";
  public masterId:string = "";
  public curChain = "ELA";
  public fee:number = 0;
  public feePerKb:number = 10000;
  public walletInfo = {};
  public deposit;
  public countrys = [];
  constructor(public navCtrl: NavController, public navParams: NavParams,public native :Native,public popupProvider: PopupProvider,public walletManager:WalletManager) {
          this.countrys = Config.getAllCountry();
          this.info = this.native.clone(this.navParams.data);
          this.masterId = Config.getCurMasterWalletId();
          this.init();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UpdateproducerPage');
  }

  init(){
    this.walletManager.getMasterWalletBasicInfo(this.masterId,(data)=>{
                 if(data["success"]){
                    this.native.info(data);
                    let item = JSON.parse(data["success"])["Account"];
                    this.walletInfo = item;
                 }
    });
  }

  updateInfo(){
    if(this.checkParms()){
      this.popupProvider.presentPrompt().then((val)=>{
        if(Util.isNull(val)){
          this.native.toast_trans("text-id-kyc-prompt-password");
          return;
        }
        this.passworld = val.toString();
        this.native.showLoading().then(()=>{
              this.generateProducerPayload();
        });
        //this.native.Go(this.navCtrl,'JoinvotelistPage');
  }).catch(()=>{

  });
    }

  }


  generateProducerPayload(){
    this.walletManager.generateProducerPayload(this.masterId,this.curChain,this.info["ownerpublickey"],this.info["nodepublickey"],this.info["nickname"],this.info["url"],this.info["netaddress"],this.info["location"],this.passworld,(data)=>{
     this.native.info(data);
     if(data["success"]){
        let payLoad = data["success"];
        this.createUpdateProducerTransaction(payLoad);
     }
   });
 }




 createUpdateProducerTransaction(payloadJson){

  this.walletManager.createUpdateProducerTransaction(this.masterId,this.curChain,"",payloadJson,"","",false,(data)=>{
    this.native.info(data);
    if(data["success"]){
      this.getFee(data["success"]);
    }
  });
}

 //计算手续费
 getFee(rawTransaction){
  this.walletManager.calculateTransactionFee(this.masterId,this.curChain,rawTransaction, this.feePerKb, (data) => {
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

  this.walletManager.updateTransactionFee(this.masterId,this.curChain,rawTransaction, this.fee,"",(data)=>{
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
  this.walletManager.signTransaction(this.masterId,this.curChain,rawTransaction,this.passworld,(data)=>{
    if(data["success"]){
      this.native.info(data);
      if(this.walletInfo["Type"] === "Standard"){
           this.sendTx(data["success"]);
      }else if(this.walletInfo["Type"] === "Multi-Sign"){
          this.walletManager.encodeTransactionToString(data["success"],(raw)=>{
                   if(raw["success"]){
                    this.native.hideLoading();
                    this.native.Go(this.navCtrl,ScancodePage,{"tx":{"chianId":this.curChain,"fee":this.fee/Config.SELA, "raw":raw["success"]}});
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
  this.walletManager.publishTransaction(this.masterId,this.curChain,rawTransaction,(data)=>{
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
      this.native.Go(this.navCtrl,ScancodePage,{"tx":{"chianId":this.curChain,"fee":this.fee/Config.SELA, "raw":raw["success"]}});
    }
});
}

checkParms(){

  if(Util.isNull(this.info['nodepublickey'])){
    this.native.toast_trans('please-node-PublicKey');
    return false;
 }

  if(Util.isNull(this.info['netaddress'])){
    this.native.toast_trans('please-enter-node-iPAddress');
    return false;
  }

  return true;
}


}
