import { Component } from '@angular/core';
import { NavController, NavParams ,Events} from 'ionic-angular';
import {WalletManager} from '../../providers/WalletManager';
import {TabsComponent} from "../tabs/tabs.component";
import {Native} from "../../providers/Native";
import {Config} from "../../providers/Config";
import {LocalStorage} from "../../providers/Localstorage";
import {ScanPage} from '../../pages/scan/scan';
@Component({
  selector: 'page-addprivatekey',
  templateUrl: 'addprivatekey.html',
})
export class AddprivatekeyPage {
  masterWalletId:string = "1";
  public  publicKey:string="";
  private msobj:any;
  public  publicKeyArr:any=[];
  public  name:string = "";
  public curIndex = 0;
  public qrcode: string=null;
  constructor(public navCtrl: NavController, public navParams: NavParams,public walletManager: WalletManager,public native:Native,public localStorage:LocalStorage,public events:Events) {
    this.native.info(this.navParams.data);
    this.msobj = this.navParams.data;
    this.name = this.msobj["name"];
    let totalCopayers = this.msobj["totalCopayers"];
    for(let index=0 ;index<totalCopayers-1;index++){
        let item ={index:index,publicKey:this.publicKey};
        this.publicKeyArr.push(item);
    }

    this.masterWalletId = Config.uuid(6,16);
    this.getMultiSignPubKeyWithPrivKey();
    this.events.subscribe("privatekey:update",(val)=>{
      this.publicKeyArr[this.curIndex]['publicKey'] = val;
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddprivatekeyPage');
  }

  copy(){
    this.native.copyClipboard(this.qrcode);
    this.native.toast_trans('copy-ok');
  }

  saomiao(index){
    this.curIndex = index;
    console.log("saomiao="+index);
    this.native.Go(this.navCtrl,ScanPage,{"pageType":"6"});
  }

  nextPage(){
     this.native.showLoading().then(()=>{
      this.createWallet();
     });
  }

  createWallet(){
     let copayers = this.getTotalCopayers();
     this.walletManager.createMultiSignMasterWalletWithPrivKey(this.masterWalletId,this.msobj["importText"],this.msobj["passWord"],copayers,this.msobj["requiredCopayers"],(data)=>{
               if(data['success']){
                 //this.native.setRootRouter(TabsComponent);
                 this.createSubWallet("ELA");
               }else{
                this.native.hideLoading();
                alert("=====createMultiSignMasterWalletWithPrivKey===error==="+JSON.stringify(data));
               }
     });
  }

  getTotalCopayers(){
    let arr = [];
    for(let index = 0;index<this.publicKeyArr.length;index++){
          let item = this.publicKeyArr[index];
          let publicKey =item["publicKey"].replace(/^\s+|\s+$/g,"");
          arr.push(publicKey);
    }
    return JSON.stringify(arr);
  }

  createSubWallet(chainId){
    // Sub Wallet
    this.walletManager.createSubWallet(this.masterWalletId,chainId,0, (data)=>{
          if(data["success"]){
               this.native.info(data)
               this.registerWalletListener(this.masterWalletId,chainId);
               this.saveWalletList();
          }else{
                this.native.hideLoading();
          }
    });
  }

  saveWalletList(){

    Config.getMasterWalletIdList().push(this.masterWalletId);
     this.localStorage.saveCurMasterId({masterId:this.masterWalletId}).then((data)=>{
      let walletObj = this.native.clone(Config.masterWallObj);
      walletObj["id"]   = this.masterWalletId;
      walletObj["wallname"] = this.name;
      walletObj["Account"] = {"SingleAddress":true,"Type":"Multi-Sign","InnerType":"Simple"};
      this.localStorage.saveMappingTable(walletObj).then((data)=>{
        let mappingList = this.native.clone(Config.getMappingList());
            mappingList[this.masterWalletId] = walletObj;
            this.native.info(mappingList);
            Config.setMappingList(mappingList);
            this.native.hideLoading();
            Config.setCurMasterWalletId(this.masterWalletId);
            this.native.setRootRouter(TabsComponent);
      });

      });
  }

  registerWalletListener(masterId,coin){
    this.walletManager.registerWalletListener(masterId,coin,(data)=>{
          if(!Config.isResregister(masterId,coin)){
            Config.setResregister(masterId,coin,true);
          }
           this.events.publish("register:update",masterId,coin,data);
    });
  }

  getMultiSignPubKeyWithPrivKey(){
    this.walletManager.getMultiSignPubKeyWithPrivKey(this.msobj["importText"],(data)=>{
      if(data["success"]){
        this.qrcode = data["success"];
       }else{
       }
    });
  }

}
