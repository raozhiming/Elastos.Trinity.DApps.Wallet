import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import {Native} from '../../services/Native';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-walletmode',
  templateUrl: './walletmode.page.html',
  styleUrls: ['./walletmode.page.scss'],
})
export class WalletmodePage implements OnInit {
  public navObj:any;
  public totalCopayers:number;
  constructor(public navCtrl: NavController, public route:ActivatedRoute, public native: Native) {
    this.route.queryParams.subscribe((data)=>{
      this.native.info(data);
      this.navObj = data;
      this.totalCopayers = data["totalCopayers"];
    });
  }

  ngOnInit() {
  }

  wayOne(){
     this.native.Go(this.navCtrl, "/wallet-create", this.navObj);
  }

  wayTwo(){
    this.native.Go(this.navCtrl, "/importprivatekey", this.navObj);
  }

  wayThree(){
    this.native.Go(this.navCtrl, "/createwalletname", this.navObj);
  }

  wayFour(){
    this.native.Go(this.navCtrl, "/importmnemonic", this.navObj);
  }

}
