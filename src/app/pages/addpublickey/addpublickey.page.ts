import { Component, OnInit } from '@angular/core';
import { NavController ,Events} from '@ionic/angular';
import {WalletManager} from '../../services/WalletManager';
import {Native} from '../../services/Native';
import {Config} from '../../services/Config';
import {LocalStorage} from '../../services/Localstorage';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-addpublickey',
  templateUrl: './addpublickey.page.html',
  styleUrls: ['./addpublickey.page.scss'],
})
export class AddpublickeyPage implements OnInit {
  masterWalletId:string = "1";
  private msobj:any;
  public  publicKeyArr:any=[];
  public  name:string ="";
  public isOnly:any;
  public innerType:any;
  public curIndex = 0;
  public qrcode: string=null;
  constructor(public navCtrl: NavController, public route:ActivatedRoute, public walletManager:WalletManager,public native :Native,public localStorage:LocalStorage,public events:Events) {
    this.route.queryParams.subscribe((data)=>{
      this.native.info(data);
      this.msobj = data;
      this.name = this.msobj["name"];

      let totalCopayers = 0;
      if(this.msobj["payPassword"]){
        this.isOnly = false;
        this.innerType ="Standard";
        totalCopayers = this.msobj["totalCopayers"]-1;
        this.getPublicKey();
      }else{
        this.isOnly = true;
        this.innerType ="Readonly";
        totalCopayers = this.msobj["totalCopayers"];
      }

      for(let index=0 ;index<totalCopayers;index++){
            let item = {index:index,publicKey:""};
            this.publicKeyArr.push(item);
      }
    });

    this.masterWalletId = Config.uuid(6,16);

    this.events.subscribe("publickey:update",(val)=>{
         this.publicKeyArr[this.curIndex]['publicKey'] = val;
    });
  }

  ngOnInit() {
    console.log('ngOnInit AddpublickeyPage');
  }

  copy(){
    this.native.copyClipboard(this.qrcode);
    this.native.toast_trans('copy-ok');
  }

  saomiao(index){
    this.curIndex = index;
    console.log("saomiao="+index);
    this.native.Go(this.navCtrl, "/scan", {"pageType":"5"});
  }

  isRepeat(arr) {
    var hash = {};
    for(var i in arr) {
      if(hash[arr[i]])
      {
        return true;
      }
  // 不存在该元素，则赋值为true，可以赋任意值，相应的修改if判断条件即可
        hash[arr[i]] = true;
        }
        return false;
    }

  nextPage(){
    let copayers = this.getTotalCopayers();
    //this.native.info(copayers);
    //this.native.info(this.isRepeat(copayers));
    if(this.isRepeat(JSON.parse(copayers))){
        this.native.toast_trans("publickey-repeat");
        return;
    }
    this.native.showLoading().then(()=>{
      if(this.msobj["payPassword"]){
        this.createWalletWithMnemonic();
      }else{
       this.createWallet();
      }
    });
  }

  createWallet(){
    let copayers = this.getTotalCopayers();
    this.walletManager.createMultiSignMasterWallet(this.masterWalletId,copayers,this.msobj["requiredCopayers"],(data)=>{
              if(data['success']){
                this.createSubWallet("ELA");
              }else{
                this.native.hideLoading();
                alert("=====createMultiSignMasterWallet===error=="+JSON.stringify(data));
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
               this.native.info(data);
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
              walletObj["Account"] = {"SingleAddress":true,"Type":"Multi-Sign","InnerType":this.innerType};
              this.localStorage.saveMappingTable(walletObj).then((data)=>{
                let mappingList = this.native.clone(Config.getMappingList());
                    mappingList[this.masterWalletId] = walletObj;
                    this.native.info(mappingList);
                    Config.setMappingList(mappingList);
                    this.native.hideLoading();
                    Config.setCurMasterWalletId(this.masterWalletId);
                    this.native.setRootRouter("/tabs");
              });
            });
  }






  createWalletWithMnemonic(){
      let copayers = this.getTotalCopayers();
      this.walletManager.createMultiSignMasterWalletWithMnemonic(this.masterWalletId,this.msobj["mnemonicStr"],this.msobj["mnemonicPassword"],this.msobj["payPassword"],copayers,this.msobj["requiredCopayers"],(data)=>{
          if(data['success']){
            this.native.info(data);
            this.createMnemonicSubWallet("ELA",this.msobj["payPassword"]);
          }else{
            this.native.hideLoading();
          }
      });
  }

  createMnemonicSubWallet(chainId,password){
    // Sub Wallet
    this.walletManager.createSubWallet(this.masterWalletId,chainId,0, (data)=>{
          if(data["success"]){
               this.native.hideLoading();
               this.native.info(data);
               this.registerWalletListener(this.masterWalletId,chainId);
               this.saveWalletList();
          }else{
                this.native.hideLoading();
                alert("createSubWallet=error:"+JSON.stringify(data));
          }
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

  getPublicKey(){

    this.walletManager.getMultiSignPubKeyWithMnemonic(this.msobj["mnemonicStr"],this.msobj["mnemonicPassword"],(data)=>{

      if(data["success"]){
        this.qrcode = data["success"];
       }else{
       }
    });
  }

}

