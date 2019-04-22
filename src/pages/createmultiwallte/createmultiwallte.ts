import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {WalltemodePage} from '../../pages/walltemode/walltemode';
import {Native} from "../../providers/Native";

@Component({
  selector: 'page-createmultiwallte',
  templateUrl: 'createmultiwallte.html',
})
export class CreatemultiwalltePage {
  public copayers: number[] =[1,2,3,4,5,6];
  public signatures: number[]=[1,2,3,4,5,6];
  public totalCopayers:number = 2;
  public requiredCopayers:number = 2;
  constructor(public navCtrl: NavController, public navParams: NavParams,public native:Native) {

  }

  ionViewDidLoad() {

  }

  public setTotalCopayers(): void {

  }

  nextPage(){
      if(this.totalCopayers<this.requiredCopayers){
           this.native.toast_trans("text-multi-error");
           return;
      }
      this.native.Go(this.navCtrl,WalltemodePage,{totalCopayers:this.totalCopayers,requiredCopayers:this.requiredCopayers});
  }

}
