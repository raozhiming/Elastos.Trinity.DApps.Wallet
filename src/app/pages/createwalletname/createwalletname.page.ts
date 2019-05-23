import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from '@ionic/angular';
import {Native} from '../../services/Native';
import {Util} from '../../services/Util';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-createwalletname',
  templateUrl: './createwalletname.page.html',
  styleUrls: ['./createwalletname.page.scss'],
})
export class CreatewalletnamePage implements OnInit {
  public navObj:any;
  public name:string = "";
  constructor(public navCtrl: NavController, public route:ActivatedRoute, public native: Native) {
    this.route.queryParams.subscribe((data)=>{
      this.navObj = data;
    });
  }

  ngOnInit() {
    console.log('ngOnInit CreatewalletnamePage');
  }

  import(){
    if(this.checkParms()){
      this.navObj["name"] = this.name;
      this.native.Go(this.navCtrl, "/addpublickey",this.navObj);
    }
  }

  checkParms(){
    if (Util.isNull(this.name)) {
      this.native.toast_trans("text-wallet-name-validator");
      return false;
    }

    if(Util.isWalletName(this.name)){
      this.native.toast_trans("text-wallet-name-validator1");
      return;
    }

    if(Util.isWallNameExit(this.name)){
      this.native.toast_trans("text-wallet-name-validator2");
      return;
    }

    return true;
  }

}
