import { Component} from '@angular/core';
import {IdHomeComponent} from "../../../pages/id/home/home";
import { NavController, NavParams} from 'ionic-angular';
import {Native} from "../../../providers/Native";
import {LocalStorage} from "../../../providers/Localstorage";
import {DataManager} from "../../../providers/DataManager";
import {Util} from "../../../providers/Util";

@Component({
  selector: 'id-import',
  templateUrl: 'import.html',
})
export class IdImportComponent {
  private kycObj:any={};
  keyStoreContent="";
  constructor(public navCtrl: NavController,public navParams: NavParams,public native :Native,public localStorage: LocalStorage,public dataManager :DataManager){
    this.init();
}
  init(){
      this.localStorage.get("kycId").then((val)=>{
            if(Util.isNull(val)){
               this.kycObj = {};
            }else{
               this.kycObj =JSON.parse(val);
            }
      })
  }

  onImport(){
    if(Util.isNull(this.keyStoreContent)){
           this.native.toast_trans("text-id-kyc-import-no-message");
           return;
    }
    let addObjs = JSON.parse(this.keyStoreContent);
    for(let key in addObjs){
      this.kycObj[key] =  addObjs[key];
    }
    this.localStorage.set('kycId',this.kycObj).then(()=>{
      this.native.toast_trans('text-exprot-sucess-message');
      this.native.Go(this.navCtrl,IdHomeComponent);
    });
  }
}
