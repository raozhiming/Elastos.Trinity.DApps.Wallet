import { Component } from '@angular/core';
import { IonicPage, NavController,ModalController, NavParams } from 'ionic-angular';
import {Native} from "../../../../providers/Native";
import {Util} from '../../../../providers/Util';
import { PopupProvider } from '../../../../providers/popup';
import { WalletManager } from '../../../../providers/WalletManager';
import { Config } from '../../../../providers/Config';
import {ScancodePage} from '../../../../pages/scancode/scancode';
import {ApiUrl} from "../../../../providers/ApiUrl";
/**
 * Generated class for the PointvotePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-pointvote',
  templateUrl: 'pointvote.html',
})
export class PointvotePage {
  public voteList = [];
  public selectNum:number = 0;
  public idChainPer = "100";
  public selectVoteObj = {};
  public isAllchecked = false;
  public selectNode = [];
  public passworld:string = "";
  public masterId:string = "";
  public curChain:string = "ELA";
  public stake:number = 10;
  public publickeys = [];
  public rawTransaction:string = "";
  public fee:number = 0;
  public feePerKb:number = 10000;
  public walletInfo = {};
  public myInterval:any;
  public countrys=[];
  public useVotedUTXO:boolean = true;
  constructor( public navCtrl: NavController,
               public navParams: NavParams,
               public modalCtrl: ModalController,
               public native: Native,
               public popupProvider:PopupProvider,
               public walletManager:WalletManager,
             ) {
              this.masterId = Config.getCurMasterWalletId();
              this.countrys = Config.getAllCountry();
              this.getVoteList();
              this.selectNode = this.navParams.data["selectNode"] || [];
              if(this.selectNode.length >0){
                      this.useVotedUTXO = true;
              }else{
                      this.useVotedUTXO = true;
              }
              this.setSelectArr(this.selectNode);
              this.selectNum = this.getSelectNum();
              if(this.selectNum>0){
                this.isAllchecked = true;
              }else{
                 this.isAllchecked = false;
              }
              this.init();

  }

  init(){
    this.walletManager.getMasterWalletBasicInfo(this.masterId,(data)=>{
                 if(data["success"]){
                    let item = JSON.parse(data["success"])["Account"];
                    this.walletInfo = item;
                 }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PointvotePage');
  }

  ionViewWillEnter(){
    this.myInterval = setInterval(()=>{
         this.getVoteList();
    },60000);
  }

 ionViewDidLeave(){
  clearInterval(this.myInterval);
 }

  vote(){
     if(this.selectNum >36){
      this.native.toast_trans("candidate-nodes-error");
          return;
     }
     if(this.selectNum>0){
      this.openPayModal();
     }else{
       this.native.toast_trans("please-select-voting-node");
     }
  }

  setSelectAll(){
    this.native.info(this.isAllchecked);
    for(let index in this.voteList){
         let id = this.voteList[index]["ownerpublickey"];
         this.selectVoteObj[id] = this.isAllchecked;
    }

    this.selectNum = this.getSelectNum();
    console.log(JSON.stringify(this.selectVoteObj));
  }

  getSelectNum(){
     let index = 0;
     for(let key in this.selectVoteObj){
        this.native.info(key);
        if(this.selectVoteObj[key]){
          index++;
        }
     }
     return index;
  }

  setSelect(ischecked,id){
    this.selectVoteObj[id] = ischecked;
    this.selectNum = this.getSelectNum();

    if(this.selectNum>0){
       this.isAllchecked = true;
    }else{
        this.isAllchecked = false;
    }
  }

  openPayModal(){
    const modal = this.modalCtrl.create("InputticketsPage",{});
    modal.onDidDismiss(data => {
      if(data){
         this.native.info(data);
         this.stake = data["votes"];
         this.popupProvider.presentPrompt().then((val)=>{
          if(Util.isNull(val)){
            this.native.toast_trans("text-id-kyc-prompt-password");
            return;
          }
          this.passworld = val.toString();
          this.native.showLoading().then(()=>{
                this.createTx();
          });

          //this.native.Go(this.navCtrl,'JoinvotelistPage');
}).catch(()=>{

});
      }
    });
    modal.present();
  }

  setSelectArr(arr){
     for(let index = 0;index<arr.length;index++){
      let id = arr[index];
      this.selectVoteObj[id] = true;
     }
  }
  //创建交易
  createTx(){
     this.publickeys = this.getSelectPublics();
     let votes = Config.accMul(this.stake,Config.SELA);
     let parms = {"1":this.masterId,"2":this.curChain,"3":votes,"4":JSON.stringify(this.publickeys),"5":"","6":this.useVotedUTXO};
     this.native.info(parms);
     this.walletManager.createVoteProducerTransaction(this.masterId,this.curChain,"",votes,JSON.stringify(this.publickeys),"","",this.useVotedUTXO,(data)=>{
      this.native.info(data);
      if(data['success']){
          let raw = data['success'];
          this.getFee(raw);
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


getVoteList(){
  this.native.getHttp().postByAuth(ApiUrl.listproducer).toPromise().then(data=>{
         if(data["status"] === 200){
             //this.native.info(data);
             let votesResult = JSON.parse(data["_body"]);
             if(votesResult["code"] === "0"){
              //this.native.info(votesResult);
              this.voteList = votesResult["data"]["result"]["producers"] || [];
             }
           }
  });
}


public getCountryByCode(code){

  for(let index in this.countrys){
      let item = this.countrys[index];
      if(code === parseInt(item["code"])){
        return item["key"];
      }
    }
    return "Unknown";
}

public getSelectPublics(){
  let arr = [];
  for(let key in this.selectVoteObj){
     this.native.info(key);
     if(this.selectVoteObj[key]){
       arr.push(key);
     }
  }
  return arr;
}

}
