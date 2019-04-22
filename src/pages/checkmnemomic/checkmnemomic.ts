import { Component,NgZone} from '@angular/core';
import { NavController, NavParams} from 'ionic-angular';
import {Native} from "../../providers/Native";
import {Util} from "../../providers/Util";

/**
 * Generated class for the CheckmnemomicPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@Component({
  selector: 'page-checkmnemomic',
  templateUrl: 'checkmnemomic.html',
})
export class CheckmnemomicPage {
  mnemonicList: Array<any> = [];
  selectList: Array<any> = [];
  mnemonicStr: string;
  selectComplete = false;
  constructor(public navCtrl: NavController, public navParams: NavParams,public native: Native,public zone:NgZone) {
        this.init();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CheckmnemomicPage');
  }

  init(){
    this.mnemonicStr = this.native.clone(this.navParams.get("mnemonicStr"));
    this.mnemonicList = this.native.clone(this.navParams.get("mnemonicList")).sort(function(){ return 0.5 - Math.random() });
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
    if(this.selectComplete){

      let mn = "";
      for(let i =0;i<this.selectList.length;i++){
        mn += this.selectList[i].text;
      }
      if(!Util.isNull(mn) && mn == this.mnemonicStr.replace(/\s+/g,"")){
        this.native.toast_trans('text-export-menmonic-sucess');
        this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length()-3));
      }else{
        this.native.toast_trans('text-mnemonic-prompt3');
      }

    }

  }

}
