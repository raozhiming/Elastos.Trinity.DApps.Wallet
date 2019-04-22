import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,ModalController} from 'ionic-angular';
import { PopupProvider } from '../../../../providers/popup';
import { Util } from '../../../../providers/Util';
import {Native} from "../../../../providers/Native";
import {  Config } from '../../../../providers/Config';
import {WalletManager} from '../../../../providers/WalletManager';
import {ScancodePage} from '../../../../pages/scancode/scancode';
/**
 * Generated class for the SignupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {
  public passworld:string;
  public nodeName:string = "";
  public publickey:string ="";
  public nodePublicKey:string="";
  public location:number = 1;
  public url:string ="";
  public countrys = [];
  public masterId:string = "";
  public curChain = "ELA";
  public fee:number = 0;
  public feePerKb:number = 10000;
  public walletInfo = {};
  public deposit;
  public iPAddress:string = "";
  constructor(public navCtrl: NavController, public navParams: NavParams,public modalCtrl: ModalController,public popupProvider:PopupProvider,public native:
    Native,public walletManager:WalletManager) {
       this.deposit = Config.deposit;
       this.countrys = Config.getAllCountry();
       this.masterId = Config.getCurMasterWalletId();
       this.getPublicKeyForVote();
       this.init();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignupPage');
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

  election(){

    if(this.checkParms()){
        this.openPayModal();
    }
  }

  openPayModal(){
    const modal = this.modalCtrl.create("LockdetailsPage",{});
    modal.onDidDismiss(data => {
      if(data){
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
    });
    modal.present();
  }

  checkParms(){

    if(Util.isNull(this.nodeName)){
       this.native.toast_trans('please-enter-node-name');
       return false;
    }

    if(Util.isNodeName(this.nodeName)){
       this.native.toast_trans('text-node-name-validator1');
       return false;
    }


    if(Util.isNull(this.nodePublicKey)){
      this.native.toast_trans('please-node-PublicKey');
      return false;
   }

    if(Util.isNull(this.iPAddress)){
      this.native.toast_trans('please-enter-node-iPAddress');
      return false;
    }

    return true;
  }

  getPublicKeyForVote(){
    this.walletManager.getPublicKeyForVote(this.masterId,this.curChain,(data)=>{
              this.native.info(data);
              if(data["success"]){
                this.publickey = data["success"];
              }
    });
  }

  generateProducerPayload(){
     this.walletManager.generateProducerPayload(this.masterId,this.curChain,this.publickey,this.nodePublicKey,this.nodeName,this.url,this.iPAddress,this.location,this.passworld,(data)=>{
      this.native.info(data);
      if(data["success"]){
         let payLoad = data["success"];
         this.createRegisterProducerTransaction(payLoad);
      }
    });
  }

  createRegisterProducerTransaction(payloadJson){
      let deposit = Config.accMul(this.deposit,Config.SELA);
      this.walletManager.createRegisterProducerTransaction(this.masterId,this.curChain,"",payloadJson,deposit,"","",false,(data)=>{
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

}
