import {Component} from '@angular/core';
import {WalletCreateComponent} from "../wallet/wallet-create/wallet-create.component";
import {ImportComponent} from "../wallet/import/import.component";
import { NavController, NavParams } from 'ionic-angular';
import {CreatemultiwalltePage} from '../../pages/createmultiwallte/createmultiwallte';
@Component({
  selector: 'app-launcher',
  templateUrl: './launcher.component.html',
})
export class LauncherComponent {


  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WalltelistPage');
  }

  onNext(type) {
    switch(type){
       case 1:
       this.navCtrl.push(WalletCreateComponent);
       break;
       case 2:
       this.navCtrl.push(ImportComponent);
       break;
       case 3:
       this.navCtrl.push(CreatemultiwalltePage);
       break;
    }
  }
}
