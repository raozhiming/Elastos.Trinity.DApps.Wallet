import {Component} from '@angular/core';
import {ViewController} from 'ionic-angular';
import {Native} from "../../providers/Native";
@Component({
  selector: 'page-coinlistpassword',
  templateUrl: 'coinlistpassword.html',
})
export class CoinlistpasswordPage {

  public payPassword: string;
  public singleAddress: boolean = false;

  constructor(public viewCtrl: ViewController,public native:Native) {

  }

  click_close() {
    //let data = {'foo': ''};
    this.viewCtrl.dismiss({});
  }

  click_button() {
    if(this.payPassword){
      this.viewCtrl.dismiss({"password":this.payPassword,"singleAddress":this.singleAddress});
    }else{
      this.native.toast_trans('text-pwd-validator');
    }
  }


  click_vcode() {

  }
}
