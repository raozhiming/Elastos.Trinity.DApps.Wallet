import { Component,NgZone} from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {LauncherComponent} from "../launcher/launcher.component";
import { Events } from 'ionic-angular';
import {LocalStorage} from "../../providers/Localstorage";
import {Config} from "../../providers/Config";
import {Native} from "../../providers/Native";
import {WalletManager} from "../../providers/WalletManager";
@Component({
  selector: 'page-walltelist',
  templateUrl: 'walltelist.html',
})
export class WalltelistPage {
   items = [];
   masterWalletId:string = "1";
  constructor(public navCtrl: NavController, public navParams: NavParams,public events: Events,public localStorage:LocalStorage,public native:Native,private zone:NgZone,public walletManager:WalletManager) {
        this.init();
  }

  ionViewDidLoad() {

  }

  init(){
     //this.items = Config.getMasterWalletIdList();
     this.masterWalletId = Config.getCurMasterWalletId();
     let mappList = Config.getMappingList();
     this.native.info(mappList);
     this.zone.run(()=>{
      this.items = Config.objtoarr(mappList);
     })
     this.native.info(this.items);
  }

  itemSelected(item: string) {
    this.native.info(item);
    let id = item["id"];
    Config.setCurMasterWalletId(id);
    this.getAllsubWallet(id);

  }

  saveId(id){
    this.localStorage.saveCurMasterId({masterId:id}).then((data)=>{
      this.native.info(id);
      Config.setCurMasterWalletId(id);
      this.masterWalletId = Config.getCurMasterWalletId();
      this.navCtrl.pop();
      //this.events.publish("wallte:update",id);
    });
  }

  nextPage(){
    this.native.Go(this.navCtrl,LauncherComponent);
  }

  registerWalletListener(masterId,coin){
    this.walletManager.registerWalletListener(masterId,coin,(data)=>{
            Config.setResregister(masterId,coin,true);
           this.events.publish("register:update",masterId,coin,data);
    });
  }

  getAllsubWallet(masterId){

      this.registerWalletListener(masterId,"ELA");
       let chinas = Config.getSubWallet(masterId);
        console.log("=========="+JSON.stringify(chinas));
        for (let chain in chinas) {
            this.registerWalletListener(masterId,chain);
        }
        this.saveId(masterId);
    }
 }
