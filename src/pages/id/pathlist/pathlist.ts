import { Component} from '@angular/core';
import {CompanypathinfoPage} from '../../../pages/id/companypathinfo/companypathinfo';
import {BankcardpathinfoPage} from '../../../pages/id/bankcardpathinfo/bankcardpathinfo';
import {PhonepathinfoPage} from '../../../pages/id/phonepathinfo/phonepathinfo';
import {IdentitypathinfoPage} from '../../../pages/id/identitypathinfo/identitypathinfo';
import { NavController, NavParams,Events } from 'ionic-angular';
import {WalletManager} from '../../../providers/WalletManager';
import {Native} from "../../../providers/Native";
import {LocalStorage} from "../../../providers/Localstorage";
import {DataManager} from "../../../providers/DataManager";
import { Util } from '../../../providers/Util';
@Component({
  selector: 'page-pathlist',
  templateUrl: 'pathlist.html',
})
export class PathlistPage{
           private  parmar ={};
           public pathList = [
                               {"name":"text-identity","path":"identityCard"},
                               {"name":"text-certified-phone","path":"phone"},
                               {"name":"text-certified-card","path":"bankCard"},
                               {"name":"text-certified-company","path":"enterprise"}];
           constructor(public navCtrl: NavController,public navParams: NavParams,public native :Native,public walletManager :WalletManager,public localStorage: LocalStorage,public events: Events,public dataManager :DataManager){
                 this.init();
           }
            init(){
              this.parmar = this.navParams.data;
            }
           onNext(item){
                this.parmar["path"] = item["path"];
                this.native.info(this.parmar);
                this.nextPage();
           }

           nextPage(){
            this.localStorage.get("kycId").then((val)=>{
              let  idsObj = JSON.parse(val);
              let  id = this.parmar["id"];
              let  path = this.parmar["path"];
              let idObj = idsObj[id];
              if(Util.isNull(idObj[path])){
                   idObj[path] = {};
                   this.localStorage.set("kycId",idsObj).then(()=>{
                   this.jumpPage(path);
                 });
              }else{
                   this.jumpPage(path);
              }
       });
           }

       jumpPage(path){
           switch(path){
              case "enterprise":
                  this.native.Go(this.navCtrl,CompanypathinfoPage,this.parmar);
               break;
              case "identityCard":
                  this.native.Go(this.navCtrl,IdentitypathinfoPage,this.parmar);
                    break;
              case "phone":
                  this.native.Go(this.navCtrl,PhonepathinfoPage,this.parmar);
                    break;
              case "bankCard":
                   this.native.Go(this.navCtrl,BankcardpathinfoPage,this.parmar);
               break;
           }
       }

}
