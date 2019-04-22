import {Component,ViewChild} from '@angular/core';
import {TabsComponent} from "../../tabs/tabs.component";
import {Util} from "../../../providers/Util";
import { Config } from '../../../providers/Config';
import { NavController, NavParams,ModalController,Events } from 'ionic-angular';
import {PaymentboxPage} from '../../../pages/paymentbox/paymentbox';
import {WalletManager} from '../../../providers/WalletManager';
import {Native} from "../../../providers/Native";
import {LocalStorage} from "../../../providers/Localstorage";
import {ScanPage} from '../../../pages/scan/scan';
import {ScancodePage} from '../../../pages/scancode/scancode';
@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html'})
export class WithdrawComponent{

  masterWalletId:string = "1";
  transfer: any = {
    toAddress: '',
    amount: '',
    memo: '',
    fee: 10000,
    payPassword:'',
    remark:'',
  };

  mainchain: any = {
    accounts: '',
    amounts: 0,
    index: 0,
    rate: 1,
  };

  balance = 0;

  chianId: string;

  feePerKb = 10000;

  rawTransaction: '';

  SELA = Config.SELA;
  walletInfo = {};
  constructor(public navCtrl: NavController,public navParams: NavParams, public walletManager: WalletManager,
    public native: Native,public localStorage:LocalStorage,public modalCtrl: ModalController,public events :Events ){
         this.init();
    }
   init() {
    this.events.subscribe("address:update",(address)=>{
      this.mainchain.accounts = address;
    });
    this.masterWalletId = Config.getCurMasterWalletId();
    let transferObj =this. navParams.data;
    this.chianId = transferObj["chianId"];
    this.walletInfo = transferObj["walletInfo"];
    this.initData();
  }

  rightHeader(){
    this.native.Go(this.navCtrl,ScanPage,{"pageType":"1"});
  }

  initData(){
    this.walletManager.getBalance(this.masterWalletId,this.chianId,Config.total,(data)=>{
      if(!Util.isNull(data["success"])){
        this.native.info(data);
        this.balance = data["success"];
      }else{
       this.native.info(data);
      }
    });
  }


  onClick(type) {
    switch (type) {
      // case 1:
      //   this.Go(ContactListComponent);
      //   break;
      case 2:   // 转账
        this.checkValue();
        break;
    }
  }

  checkValue() {
    if(Util.isNull(this.mainchain.accounts)){
      this.native.toast_trans('correct-address');
      return;
    }
    if(Util.isNull(this.transfer.amount)){
      this.native.toast_trans('amount-null');
      return;
    }
    if(!Util.number(this.transfer.amount)){
      this.native.toast_trans('correct-amount');
      return;
    }

    if(this.transfer.amount <= 0){
      this.native.toast_trans('correct-amount');
      return;
    }

    if(this.transfer.amount > this.balance){
      this.native.toast_trans('error-amount');
      return;
    }

    if(this.transfer.amount.toString().indexOf(".") >-1 && this.transfer.amount.toString().split(".")[1].length>8){
      this.native.toast_trans('correct-amount');
      return;
    }

    this.walletManager.isAddressValid(this.masterWalletId,this.mainchain.accounts, (data) => {
      if (!data['success']) {
        this.native.toast_trans("contact-address-digits");
        return;
      }
      this.native.showLoading().then(()=>{
        this.createWithdrawTransaction();
      })

    })
  }

  createWithdrawTransaction(){

    let toAmount = 0;
    //toAmount = parseFloat((this.transfer.amount*Config.SELA).toPrecision(16));
    toAmount = this.accMul(this.transfer.amount,Config.SELA);
    let mainchainAddress = this.mainchain.accounts;
    this.walletManager.createWithdrawTransaction(this.masterWalletId,this.chianId, "",
      toAmount, // user input amount
      mainchainAddress, // user input address
      this.transfer.memo,
      this.transfer.remark,
      (data)=>{
        if(data['success']){
          this.native.info(data);
          this.rawTransaction = data['success'];
          this.getFee();
        }else{
          this.native.info(data);
        }
      });
  }

  getFee(){
    this.walletManager.calculateTransactionFee(this.masterWalletId,this.chianId, this.rawTransaction, this.feePerKb, (data) => {
      if(data['success']){
        this.native.hideLoading();
        this.native.info(data);
        this.transfer.fee = data['success'];
        this.transfer.rate = this.mainchain.rate;
        //let transfer = this.native.clone(this.transfer);
        this.openPayModal(this.transfer);
      }else{
        this.native.info(data);
      }
    });
  }

  // getRate(){
  //   this.sidechain.rate = 1;
  // }

  sendRawTransaction(){
    this.updateTxFee();
  }

  updateTxFee(){
    this.walletManager.updateTransactionFee(this.masterWalletId,this.chianId,this.rawTransaction, this.transfer.fee,"",(data)=>{
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
    this.walletManager.signTransaction(this.masterWalletId,this.chianId,rawTransaction,this.transfer.payPassword,(data)=>{
      if(data["success"]){
        this.native.info(data);
        if(this.walletInfo["Type"] === "Standard"){
          this.sendTx(data["success"]);
        }else if(this.walletInfo["Type"] === "Multi-Sign"){
          this.walletManager.encodeTransactionToString(data["success"],(raw)=>{
            if(raw["success"]){
             this.native.hideLoading();
             this.native.Go(this.navCtrl,ScancodePage,{"tx":{"chianId":this.chianId,"fee":this.transfer.fee/Config.SELA, "raw":raw["success"]}});
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
    this.walletManager.publishTransaction(this.masterWalletId,this.chianId,rawTransaction,(data)=>{
     if(data["success"]){
       this.native.hideLoading();
       this.native.info(data);
       this.native.setRootRouter(TabsComponent);
      }else{
        this.native.info(data);
      }

    })
 }

 openPayModal(data){
  let transfer = this.native.clone(data);
      transfer["accounts"] = this.mainchain.accounts;
      //this.transfer["rate"] = this.mainchain.rate;
  const modal = this.modalCtrl.create(PaymentboxPage,transfer);
  modal.onDidDismiss(data => {
    if(data){
      this.native.showLoading().then(()=>{
        this.transfer = data;
        this.sendRawTransaction();
      });
    }
  });
  modal.present();
}

readWallet(raws){
  this.walletManager.encodeTransactionToString(raws,(raw)=>{
    if(raw["success"]){
      this.native.hideLoading();
      this.native.Go(this.navCtrl,ScancodePage,{"tx":{"chianId":this.chianId,"fee":this.transfer.fee/Config.SELA, "raw":raw["success"]}});
    }else{
     alert("=====encodeTransactionToString===error==="+JSON.stringify(raw));
    }
});
}

accMul(arg1,arg2)
{
let m=0,s1=arg1.toString(),s2=arg2.toString();
try{m+=s1.split(".")[1].length}catch(e){}
try{m+=s2.split(".")[1].length}catch(e){}
return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m)
}


}
