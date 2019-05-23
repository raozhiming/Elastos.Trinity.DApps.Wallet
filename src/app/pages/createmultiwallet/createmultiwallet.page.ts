import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from '@ionic/angular';
import {Native} from '../../services/Native';

@Component({
  selector: 'app-createmultiwallet',
  templateUrl: './createmultiwallet.page.html',
  styleUrls: ['./createmultiwallet.page.scss'],
})
export class CreatemultiwalletPage implements OnInit {
  public copayers: number[] =[1,2,3,4,5,6];
  public signatures: number[]=[1,2,3,4,5,6];
  public totalCopayers:number = 2;
  public requiredCopayers:number = 2;

  constructor(public navCtrl: NavController, public native:Native) { }

  ngOnInit() {
  }

  public setTotalCopayers(): void {

  }

  nextPage(){
    if(this.totalCopayers<this.requiredCopayers){
         this.native.toast_trans("text-multi-error");
         return;
    }
    this.native.Go(this.navCtrl, "/walletmode",{totalCopayers:this.totalCopayers,requiredCopayers:this.requiredCopayers});
}

}

