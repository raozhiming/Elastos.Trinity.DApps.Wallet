import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ViewController} from 'ionic-angular';
import {Util} from "../../../../providers/Util";
import {Native} from "../../../../providers/Native";
import { Config } from '../../../../providers/Config';
import { WalletManager } from '../../../../providers/WalletManager';

/**
 * Generated class for the InputticketsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-inputtickets',
  templateUrl: 'inputtickets.html',
})
export class InputticketsPage {
  public votes;
  public masterWalletId;
  public balance;
  constructor(public navCtrl: NavController, public navParams: NavParams,public  viewCtrl: ViewController,public native :Native,public walletManager:WalletManager) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InputticketsPage');
  }

  click_close(){
    this.viewCtrl.dismiss(null);
  }

  click_button(){

    if(Util.isNull(this.votes)){
      this.native.toast_trans("please-input-votes");
        return;
    }

    if(!Util.number(this.votes)){
      this.native.toast_trans('Input value is incorrect');
      return;
    }

    if(this.votes.toString().indexOf(".") >-1 && this.votes.toString().split(".")[1].length>8){
      this.native.toast_trans('Input value is incorrect');
      return;
    }


    // if(parseFloat(this.votes) > this.balance){
    //   this.native.toast_trans("Input value is incorrect");
    //    return;
    // }
    this.viewCtrl.dismiss({"votes":this.votes});
  }

  getBalance(){
    this.masterWalletId = Config.getCurMasterWalletId();
    this.walletManager.getBalance(this.masterWalletId,'ELA',0,(data)=>{
      if(!Util.isNull(data["success"])){
        this.native.info(data);
        this.balance = data["success"]/Config.SELA;
      }else{
       this.native.info(data);
      }
    });
  }

  ionViewWillEnter(){
    this.getBalance();
  }

}
