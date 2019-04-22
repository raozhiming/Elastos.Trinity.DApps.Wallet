import {Component,ViewChild} from '@angular/core';
import { NavController, NavParams,Navbar,Events } from 'ionic-angular';
import {WalletManager} from '../../providers/WalletManager';
import {Native} from "../../providers/Native";
import { Config } from '../../providers/Config';
import { Util } from '../../providers/Util';
import {TransferComponent} from "./transfer/transfer.component";
import {CoinSelectComponent} from "./coin-select/coin-select.component";
import {WithdrawComponent} from "./withdraw/withdraw.component";
import {ReceiveComponent} from "./receive/receive.component";
import {RecordinfoComponent} from "./recordinfo/recordinfo.component";



@Component({
  selector: 'coin',
  templateUrl: './coin.component.html',
})
export class CoinComponent{
  @ViewChild(Navbar) navBar: Navbar;
  public masterWalletInfo = {};
  masterWalletId:string = "1";
  transferList = [];

  coinCount = 0;

  coinId = 0;

  coinName = "";
  pageNo =0;
  start = 0;

  textShow = '';

  elaPer:any;
  idChainPer:any;
  isShowMore = false;
  MaxCount = 0;
  isNodata:boolean = false;
  public myInterval:any;
  public jiajian:any="";
  public votedCount = 0;
  constructor(public navCtrl: NavController,public navParams: NavParams, public walletManager: WalletManager,public native: Native,public events: Events) {
            //this.init();
  }
  ionViewWillEnter(){
    this.pageNo =0;
    this.start = 0;
    this.MaxCount =0;
    this.transferList = [];
    this.init();
 }

 ionViewDidLeave(){
  //clearInterval(this.myInterval);
 }
  init() {
    this.masterWalletId = Config.getCurMasterWalletId();
    this.walletManager.getMasterWalletBasicInfo(this.masterWalletId,(data)=>{
                 if(data["success"]){
                    this.native.info(data);
                    let item = JSON.parse(data["success"])["Account"];
                    this.masterWalletInfo = item;
                 }else{
                    alert("=======getMasterWalletBasicInfo====error====="+JSON.stringify(data));
                 }
    });

    this.coinName = this.navParams.get("name");
    this.elaPer = this.navParams.get("elaPer") || 0;
    this.idChainPer = this.navParams.get("idChainPer") || 0;
    if (this.coinName == 'ELA') {
      this.textShow = 'text-recharge';
    }else{
      this.textShow = 'text-withdraw';
    }
    this.initData();
  }

  ionViewDidLoad() {
    this.navBar.backButtonClick = (e)=>{
      this.navCtrl.pop();
    };
  }

  initData(){
    this.walletManager.getBalance(this.masterWalletId,this.coinName,Config.total,(data)=>{
      if(!Util.isNull(data["success"])){
        this.native.info(data);
        this.coinCount = data["success"]/Config.SELA;
      }else{
        this.native.info(data);
      }
    });

    if(this.coinName === "ELA"){
      this.walletManager.getBalance(this.masterWalletId,this.coinName,Config.voted,(data)=>{
        if(!Util.isNull(data["success"])){
          this.native.info(data);
          this.votedCount = data["success"]/Config.SELA;
        }else{
          this.native.info(data);
        }
      });
    }
    this.getAllTx();

    // this.myInterval = setInterval(()=>{

    //   this.walletManager.getBalance(this.masterWalletId,this.coinName,0, (data)=>{
    //     if(!Util.isNull(data["success"])){
    //       this.native.info(data);
    //       this.coinCount = data["success"]/Config.SELA;
    //     }else{
    //       this.native.info(data);
    //     }
    //    });

    //       this.pageNo = 0;
    //       this.transferList =[];
    //       this.getAllTx();
    // },1000);
  }

  getAllTx(){
    this.walletManager.getAllTransaction(this.masterWalletId,this.coinName, this.start, '', (data) => {
      if(data["success"]){
      let allTransaction = JSON.parse(data['success']);
      let transactions = allTransaction['Transactions'];
      this.MaxCount = allTransaction['MaxCount'];
      if(this.MaxCount>0){
         this.isNodata = false;
      }else{
         this.isNodata = true;
      }

      if(this.start >= this.MaxCount){
        this.isShowMore = false;
        return;
      }else{
        this.isShowMore = true;
      }
      if(!transactions){
          this.isShowMore = false;
          return;
      }

      if(this.MaxCount<=20){
        this.isShowMore = false;
      }
      for (let key in transactions) {
        let transaction = transactions[key];
        let timestamp = transaction['Timestamp']*1000;
        let datetime = Util.dateFormat(new Date(timestamp));
        let txId = transaction['TxHash'];
        let payStatusIcon = transaction["Direction"];
        let jiajian ="";
        if (payStatusIcon === "Received") {
          payStatusIcon = './assets/images/tx-state/icon-tx-received-outline.svg';
          jiajian = "+";
        } else if(payStatusIcon === "Sent") {
          payStatusIcon = './assets/images/tx-state/icon-tx-sent.svg';
          jiajian = "-";
        } else if(payStatusIcon === "Moved") {
          payStatusIcon = './assets/images/tx-state/icon-tx-moved.svg';
          jiajian = "";
        } else if(payStatusIcon === "Deposit") {
          payStatusIcon = './assets/images/tx-state/icon-tx-moved.svg';
          if(transaction["Amount"]>0){
            jiajian = "-";
          }else{
            jiajian = "";
          }
        }
        let status = '';
        switch(transaction["Status"])
        {
          case 'Confirmed':
            status = 'Confirmed'
            break;
          case 'Pending':
            status = 'Pending'
            break;
          case 'Unconfirmed':
            status = 'Unconfirmed'
            break;
        }
        let transfer = {
          "status": status,
          "resultAmount":transaction["Amount"]/Config.SELA,
          "datetime": datetime,
          "timestamp": timestamp,
          "txId": txId,
          "payStatusIcon": payStatusIcon,
          "fuhao":jiajian
        }
        this.transferList.push(transfer);
      }
      }else{
          alert("====getAllTransaction====error");
      }
    });
  }

  onItem(item) {
    this.native.Go(this.navCtrl,RecordinfoComponent, {chainId: this.coinName, txId: item.txId});
  }

  onNext(type) {
    switch (type) {
      case 1:
        this.native.Go(this.navCtrl,ReceiveComponent, {id: this.coinId, chianId: this.coinName});
        break;
      case 2:
      if (this.coinName == 'ELA') {
        // if(this.elaPer != 1){
        //   this.messageBox("text-ela-per-message");
        //   return;
        // }
        this.native.Go(this.navCtrl,TransferComponent, {id: this.coinId, chianId: this.coinName,"walletInfo":this.masterWalletInfo});
      }else{
        // if(this.idChainPer != 1){
        //   this.messageBox("text-ela-per-message");
        //   return;
        // }
        this.native.Go(this.navCtrl,TransferComponent, {id: this.coinId, chianId: this.coinName,"walletInfo":this.masterWalletInfo});
      }

        break;
      case 3:
        if (this.coinName == 'ELA') {
          // if(this.elaPer != 1){
          //   this.messageBox("text-ela-per-message");
          //   return;
          // }
          this.native.Go(this.navCtrl,CoinSelectComponent, {chianId: this.coinName,"walletInfo":this.masterWalletInfo});
        }else{
          // if(this.idChainPer != 1){
          //   this.messageBox("text-ela-per-message");
          //   return;
          // }
          this.native.Go(this.navCtrl,WithdrawComponent, {chianId: this.coinName,"walletInfo":this.masterWalletInfo});
        }
        break;
    }
  }

  clickMore(){
    this.pageNo++;
    this.start = this.pageNo*20;
    if(this.start >= this.MaxCount){
      this.isShowMore = false;
      return;
    }
    this.isShowMore = true;
    this.getAllTx();
  }

  doRefresh(refresher){
    this.walletManager.getBalance(this.masterWalletId,this.coinName,Config.total,(data)=>{
      if(!Util.isNull(data["success"])){
        this.native.info(data);
        this.coinCount = data["success"]/Config.SELA;
      }else{
        this.native.info(data);
      }
     });
    this.pageNo = 0;
    this.start = 0;
    this.transferList =[];
    this.MaxCount = 0;
    this.getAllTx();
    setTimeout(() => {
      refresher.complete();
    },1000);
  }
}
