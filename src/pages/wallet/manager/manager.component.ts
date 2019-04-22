import {Component} from '@angular/core';
import { NavController, NavParams,Events,App} from 'ionic-angular';
import {LocalStorage} from "../../../providers/Localstorage";
import {PopupProvider} from "../../../providers/popup";
import {WalletManager} from '../../../providers/WalletManager';
import {ExprotPrikeyComponent} from "../exprot-prikey/exprot-prikey.component";
import {PaypasswordResetComponent} from "../paypassword-reset/paypassword-reset.component";
import {LauncherComponent} from "../../launcher/launcher.component";
import {Native} from "../../../providers/Native";
import {Config} from "../../../providers/Config";
import {TabsComponent} from "../../tabs/tabs.component"
import {ModifywalletnamePage} from '../../../pages/modifywalletname/modifywalletname';
import {PublickeyPage} from '../../../pages/publickey/publickey';
import {ExportmnemomicPage} from '../../../pages/exportmnemomic/exportmnemomic';
@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
})
export class ManagerComponent {

  walletName = "";
  masterWalletId:string = "1";
  public currentLanguageName:string = "";
  public readonly:string = "";
  public masterWalletType:string = "";
  public singleAddress:boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams,public events: Events,public localStorage:LocalStorage,public popupProvider: PopupProvider, public walletManager: WalletManager,private app: App,public native:Native) {
    this.masterWalletId = Config.getCurMasterWalletId();
    this.walletName = Config.getWalletName(this.masterWalletId);
    this.getMasterWalletBasicInfo();
  }

  ionViewWillEnter(){
    this.walletName = Config.getWalletName(this.masterWalletId);
  }

  ionViewDidLeave(){
      //this.walletName = Config.getWalletName(this.masterWalletId);
  }

  onItem(i) {
    switch (i){
      case 0:
        this.native.Go(this.navCtrl,ExprotPrikeyComponent);
        break;
      case 1:
       this.native.Go(this.navCtrl,PaypasswordResetComponent);
        break;
      case 2:
        this.popupProvider.ionicConfirm('confirmTitle', 'confirmSubTitle').then((data) => {
          if (data) {
            this.native.showLoading().then(()=>{
			      this.destroyWallet(this.masterWalletId);
            });
          }
        });
        break;
      case 3:
        this.native.Go(this.navCtrl,PublickeyPage);
         break;
      case 4:
         this.native.Go(this.navCtrl,ModifywalletnamePage);
         break;
      case 5:
         this.native.Go(this.navCtrl,ExportmnemomicPage);
         break;
    }
  }


  getAllCreatedSubWallets(){

    this.walletManager.getAllSubWallets(this.masterWalletId,(data) => {
      if(data["success"]){
        let chinas = JSON.parse(data["success"]);
        let maxLen = chinas.length;
        for (let index in chinas) {
          let chain = chinas[index];
          this.destroyWalletListener(index,maxLen,this.masterWalletId,chain);
        }
      }else{
          this.native.hideLoading();
          alert("==getAllSubWallets==error"+JSON.stringify(data));
      }

    });

}

  destroyWalletListener(index,maxLen,masterWalletId,chainId){
      this.walletManager.removeWalletListener(masterWalletId,chainId,(data)=>{
                if(data["success"]){
                    if(parseInt(index) === (maxLen-1)){
                        this.destroyWallet(masterWalletId);
                    }
                }else{
                  alert("==getAllSubWallets==error"+JSON.stringify(data));
                }
      });
  }

  destroyWallet(masterWalletId: string){
    //this.localStorage.remove('coinListCache').then(()=>{
        this.walletManager.destroyWallet(masterWalletId, (data)=>{
          if(data["success"]){
            this.native.info(data);
            this.delWalletListOne(masterWalletId);
          }else{
            this.native.info(data);
          }
        });
    //});
  }

  delWalletListOne(masterWalletId){
    this.native.info(masterWalletId);
    let arr = Config.getMasterWalletIdList();
     let index = arr.indexOf(masterWalletId);
     this.native.info(index);
     if (index > -1) {
         arr.splice(index, 1);
     }

     if(arr.length === 0){
      this.saveWalletList1();
      return;
     }
     this.native.info(arr);
     Config.setCurMasterWalletId(arr[0]);
     //Config.setMasterWalletIdList(arr);
     let allmastwalle = this.native.clone(Config.getMappingList());
     delete(allmastwalle[this.masterWalletId]);
     this.native.info(allmastwalle);
     Config.setMappingList(allmastwalle);
     this.saveWalletList(arr[0]);
  }

  saveWalletList(masterWalletId){
            this.localStorage.saveCurMasterId({masterId:masterWalletId}).then((data)=>{
              this.native.hideLoading();
              Config.setCurMasterWalletId(masterWalletId);
              this.native.setRootRouter(TabsComponent);
            });
  }

  saveWalletList1(){
        this.native.hideLoading();
        Config.setMappingList({});
        this.native.setRootRouter(LauncherComponent);
  }

  getMasterWalletBasicInfo(){
    this.walletManager.getMasterWalletBasicInfo(this.masterWalletId,(data)=>{
      if(data["success"]){
         this.native.info(data);
         let item = JSON.parse(data["success"])["Account"];
         this.masterWalletType = item["Type"] ;
         this.singleAddress = item["SingleAddress"];
         this.readonly = item["InnerType"] || "";
      }else{
         this.native.info(data);
      }
    });
  }
}
