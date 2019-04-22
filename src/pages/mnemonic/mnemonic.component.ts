import {Component} from '@angular/core';
import { NavController,NavParams,Events} from 'ionic-angular';
import {Native} from "../../providers/Native";
import {WalletManager} from '../../providers/WalletManager';
import {Config} from '../../providers/Config';
import {WriteComponent} from "./write/write.component";
import {Util} from "../../providers/Util";
import {LocalStorage} from "../../providers/Localstorage";


@Component({
  selector: 'app-mnemonic',
  templateUrl: './mnemonic.component.html'
})
export class MnemonicComponent {
  masterWalletId:string = "1";
  mnemonicList = [];
  mnemonicStr: string;
  mnemonicPassword: string="";
  mnemonicRepassword: string;
  payPassword: string;
  name: string;
  singleAddress: boolean = false;
  defaultCointype = "Ela";
  isSelect:boolean = false;
  multType:any;
  constructor(public navCtrl: NavController,public navParams: NavParams, public walletManager: WalletManager,public native: Native,public localStorage:LocalStorage,public events :Events){
          native.showLoading().then(()=>{
                 this.init();
          })

  }
  init() {
    this.masterWalletId = Config.uuid(6,16);
    this.walletManager.generateMnemonic(this.native.getMnemonicLang(),(data) => {

      if(data["success"]){
        this.native.hideLoading();
        this.native.info(data);
        this.mnemonicStr = data["success"].toString();
        let mnemonicArr = this.mnemonicStr.split(/[\u3000\s]+/);
        for (var i = 0; i < mnemonicArr.length; i++) {
          this.mnemonicList.push({text: mnemonicArr[i], selected: false});
        }
      }else{
            this.native.info(data);
      }
    });
    this.payPassword = this.navParams.get("payPassword");
    this.name = this.navParams.get("name");
    this.singleAddress = this.navParams.get("singleAddress");
    this.multType = this.navParams.get("mult");
  }

  onNext() {
    if (!Util.password(this.mnemonicPassword) && this.isSelect) {
      this.native.toast_trans("text-pwd-validator");
      return;
    }

    if (this.mnemonicPassword != this.mnemonicRepassword && this.isSelect) {
      this.native.toast_trans("text-repwd-validator");
      return;
    }

    if(!this.isSelect){
      this.mnemonicPassword = "";
      this.mnemonicRepassword ="";
    }

    if(!Util.isEmptyObject(this.multType)){
        this.native.Go(this.navCtrl,WriteComponent, {"mult":this.multType,mnemonicStr: this.mnemonicStr, mnemonicList: this.mnemonicList,"totalCopayers":this.multType["totalCopayers"],"requiredCopayers":this.multType["requiredCopayers"],"mnemonicPassword":this.mnemonicPassword,"payPassword":this.payPassword,name:this.name});
        return;
    }
    this.native.showLoading().then(()=>{

      this.walletManager.createMasterWallet(this.masterWalletId, this.mnemonicStr, this.mnemonicPassword, this.payPassword,this.singleAddress,(data) =>{
        if(data["success"]){
         this.native.info(data);
         this.createSubWallet('ELA');
        }else{
          this.native.info(data);
        }
     });

    });

  }

  createSubWallet(chainId){
    // Sub Wallet
    this.walletManager.createSubWallet(this.masterWalletId,chainId,0, (data)=>{
          if(data["success"]){
              let walletObj = this.native.clone(Config.masterWallObj);
                  walletObj["id"]   = this.masterWalletId;
                  walletObj["wallname"] = this.name;
                  walletObj["Account"] = {"SingleAddress":this.singleAddress,"Type":"Standard"};
              this.localStorage.saveMappingTable(walletObj).then((data)=>{
                let mappingList = this.native.clone(Config.getMappingList());
                mappingList[this.masterWalletId] = walletObj;
               this.native.info(mappingList);
                Config.setMappingList(mappingList);
                  this.saveWalletList();
                  this.registerWalletListener(this.masterWalletId,chainId);

              });
          }else{
                alert("createSubWallet=error:"+JSON.stringify(data));
          }
    });
  }

  saveWalletList(){
    Config.getMasterWalletIdList().push(this.masterWalletId);
            this.localStorage.saveCurMasterId({masterId:this.masterWalletId}).then((data)=>{
              this.native.hideLoading();
              Config.setCurMasterWalletId(this.masterWalletId);
              this.native.Go(this.navCtrl,WriteComponent, {mnemonicStr: this.mnemonicStr, mnemonicList: this.mnemonicList});
            });
  }

  registerWalletListener(masterId,coin){
    this.walletManager.registerWalletListener(masterId,coin,(data)=>{
          if(!Config.isResregister(masterId,coin)){
            Config.setResregister(masterId,coin,true);
          }
           this.events.publish("register:update",masterId,coin,data);
           //this.saveWalletList();
    });
  }
}
