import { Component } from '@angular/core';
import { NavController, NavParams ,Events} from 'ionic-angular';
import {WalletManager} from '../../providers/WalletManager';
import {Config} from '../../providers/Config';
import {Native} from "../../providers/Native";
import {Util} from "../../providers/Util";
import {CheckmnemomicPage} from '../../pages/checkmnemomic/checkmnemomic';
/**
 * Generated class for the ExportmnemomicPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-exportmnemomic',
  templateUrl: 'exportmnemomic.html',
})
export class ExportmnemomicPage {
  public payPassword:string = '';
  public masterWalletId:string ="1";
  public mnemonicList = [];
  public isShow:boolean = true;
  public mnemonicStr:string="";
  public walltename:string ="";
  public account:any={};
  constructor(public navCtrl: NavController,public navParams: NavParams, public walletManager: WalletManager,public native: Native,public events:Events) {
         this.init();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ExportmnemomicPage');
  }

  ionViewWillEnter(){
    this.masterWalletId = Config.getCurMasterWalletId();
    this.walltename = Config.getWalletName(this.masterWalletId);
    this.account = Config.getAccountType(this.masterWalletId);
    this.events.subscribe("error:update",()=>{
       this.isShow = true;
    });
  }

  init(){
      this.masterWalletId = Config.getCurMasterWalletId();
      this.walltename = Config.getWalletName(this.masterWalletId);
  }

  checkparms(){
    if (!Util.password(this.payPassword)) {
      this.native.toast_trans("text-pwd-validator");
      return;
    }
    return true;
  }

  onNext(){
       this.native.Go(this.navCtrl,CheckmnemomicPage,{mnemonicStr: this.mnemonicStr, mnemonicList: this.mnemonicList})
  }

  onExport(){
    if(this.checkparms()){
      this.walletManager.exportWalletWithMnemonic(this.masterWalletId,this.payPassword,(data)=>{
               this.native.info(data);
               if(data["success"]){
                 this.mnemonicStr = data["success"].toString();
                 let mnemonicArr = this.mnemonicStr.split(/[\u3000\s]+/);
                 for (var i = 0; i < mnemonicArr.length; i++) {
                   this.mnemonicList.push({"text": mnemonicArr[i], "selected": false});
                   //this.mnemonicList.push(mnemonicArr[i]);
                 }
                 this.isShow = false;
               }
      })
   }
  }

  ionViewDidLeave() {
    this.events.unsubscribe("error:update");
 }

}
