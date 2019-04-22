import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {WalletManager} from '../../providers/WalletManager';
/**
 * Generated class for the AboutPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {
  public spvVersion = "0";
  constructor(public navCtrl: NavController, public navParams: NavParams,public walletManager:WalletManager) {
        this.init();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AboutPage');
  }

  init(){
    this.walletManager.getVersion((data)=>{
      if(data['success']){
          this.spvVersion = data['success'];
      }
    });
 }

}
