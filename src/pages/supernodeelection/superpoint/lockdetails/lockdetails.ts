import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ViewController} from 'ionic-angular';
import { Config } from '../../../../providers/Config';
import { WalletManager } from '../../../../providers/WalletManager';
import {Util} from "../../../../providers/Util";
import {Native} from "../../../../providers/Native";
/**
 * Generated class for the LockdetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-lockdetails',
  templateUrl: 'lockdetails.html',
})
export class LockdetailsPage {
  public deposit;
  public masterWalletId;
  public balance;
  constructor(public navCtrl: NavController, public navParams: NavParams,public  viewCtrl: ViewController,public walletManager :WalletManager,public native :Native) {
        this.deposit = Config.deposit;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LockdetailsPage');
  }

  ionViewWillEnter(){
     this.getBalance();
  }

  click_close(){
    console.log("click_close");
    this.viewCtrl.dismiss(null);
  }

  click_button(){
    if(this.balance > this.deposit){
      this.viewCtrl.dismiss(1);
    }else{
      this.native.toast_trans("error-amount");
    }
  }

  getBalance(){
    this.masterWalletId = Config.getCurMasterWalletId();
    this.walletManager.getBalance(this.masterWalletId,'ELA',0,(data)=>{
      if(!Util.isNull(data["success"])){
        this.native.info(data);
        this.balance = data["success"];
      }else{
       this.native.info(data);
      }
    });
  }


}
