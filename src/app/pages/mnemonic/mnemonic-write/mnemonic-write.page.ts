import { Component, OnInit, NgZone } from '@angular/core';
import { NavController} from '@ionic/angular';
import {Native} from '../../../services/Native';
import {Util} from "../../../services/Util";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-mnemonic-write',
  templateUrl: './mnemonic-write.page.html',
  styleUrls: ['./mnemonic-write.page.scss'],
})
export class MnemonicWritePage implements OnInit {
  mnemonicList: Array<any> = []
  selectList: Array<any> = [];
  mnemonicStr: string;
  selectComplete = false;
  multType:any;
  exatParm:any;
  constructor(public navCtrl: NavController, public route: ActivatedRoute, public native: Native,public zone:NgZone){
    this.route.queryParams.subscribe((data)=>{
      this.exatParm = this.native.clone(data);
      this.multType = data["mult"];
      this.mnemonicStr = this.native.clone(data["mnemonicStr"]);
      this.mnemonicList = this.native.clone(data["mnemonicList"]).sort(function(){ return 0.5 - Math.random() });
    });
  }

  ngOnInit() {
  }

  onNext() {
    let mn = "";
    for(let i =0;i<this.selectList.length;i++){
      mn += this.selectList[i].text;
    }

    if(!Util.isNull(mn) && mn == this.mnemonicStr.replace(/\s+/g,"")){
      if(this.multType){
         this.native.Go(this.navCtrl, "/mpublickey",this.exatParm);
      }else{
        this.native.toast_trans('text-mnemonic-ok');
        this.native.setRootRouter("/tabs");
      }

    }else{
      this.native.toast_trans('text-mnemonic-prompt3');
    }
  }

  public addButton(index: number, item: any): void {
    var newWord = {
      text: item.text,
      prevIndex: index
    };
    this.zone.run(()=>{
      this.selectList.push(newWord);
      this.mnemonicList[index].selected = true;
      this.shouldContinue();
    });
  }



  public removeButton(index: number, item: any): void {
    this.zone.run(()=>{
    this.selectList.splice(index, 1);
    this.mnemonicList[item.prevIndex].selected = false;
    this.shouldContinue();
    });
  }

  private shouldContinue(): void {
    this.selectComplete = this.selectList.length === this.mnemonicList.length ? true : false;
  }
}

