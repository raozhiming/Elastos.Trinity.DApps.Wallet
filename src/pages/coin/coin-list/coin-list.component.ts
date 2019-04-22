import {Component,ViewChild} from '@angular/core';
import { NavController, NavParams,ModalController,Navbar,Events } from 'ionic-angular';
import {WalletManager} from '../../../providers/WalletManager';
import {Native} from "../../../providers/Native";
import {LocalStorage} from "../../../providers/Localstorage";
import { Config } from '../../../providers/Config';

@Component({
  selector: 'app-coin-list',
  templateUrl: './coin-list.component.html'
})
export class CoinListComponent {
  @ViewChild(Navbar) navBar: Navbar;
  masterWalletId:string = "1";
  coinList = [];
  coinListCache = {};
  payPassword: string = "";
  singleAddress: boolean = false;
  currentCoin:any;
  constructor(public navCtrl: NavController,public navParams: NavParams, public walletManager: WalletManager,
              public native: Native,public localStorage:LocalStorage,public modalCtrl: ModalController,public events :Events ) {
             this.init();
  }

  ionViewDidLoad() {
    this.navBar.backButtonClick = (e)=>{
      this.navCtrl.pop();
    };
  }

  onSelect(item) {
     this.native.info(item);
     if(item.open){
      this.currentCoin = item;
      this.native.showLoading().then(()=>{
        this.createSubWallet();
      });
     }else{
        this.native.showLoading().then(()=>{
          this.walletManager.destroySubWallet(this.masterWalletId,item.name,(data)=>{
            if(data['success']){
             this.native.hideLoading();
             Config.setResregister(this.masterWalletId,item.name,false);
             let subWallte = Config.getSubWallet(this.masterWalletId);
             delete(subWallte[item.name]);
             let walletObj = this.native.clone(Config.masterWallObj);
             walletObj["id"]   = this.masterWalletId;
             walletObj["wallname"] = Config.getWalletName(this.masterWalletId);
             walletObj["Account"] = Config.getAccountType(this.masterWalletId);
             walletObj["coinListCache"] = subWallte;
             this.localStorage.saveMappingTable(walletObj).then((data)=>{
               let  mappingList = this.native.clone(Config.getMappingList());
               mappingList[this.masterWalletId] = walletObj;
              this.native.info(mappingList);
               Config.setMappingList(mappingList);
             });
            }
          });
        });
     }
  }

  init() {
    this.events.subscribe("error:update",()=>{
      this.currentCoin["open"] = false;
    });
    this.events.subscribe("error:destroySubWallet",()=>{
      this.currentCoin["open"] = true;
    });
    this.masterWalletId =Config.getCurMasterWalletId();
      let subWallte= Config.getSubWallet(this.masterWalletId);
      this.walletManager.getSupportedChains(this.masterWalletId,(data) => {
        if(data['success']){
          this.native.info(data);
          this.native.hideLoading();
          let allChains = data['success'];
          for (let index in allChains) {
            let chain = allChains[index];
            let isOpen = false;
            if (subWallte) {
              isOpen = chain in subWallte ? true : false;
            }
            if (chain == "ELA") {
              isOpen = true;
            }
            this.coinList.push({name: chain, open: isOpen});
          }
        }else{
            this.native.info(data);
        }
      });
    //});
  }

  createSubWallet(){
    // Sub Wallet IdChain
    let chainId = this.currentCoin["name"];
    this.walletManager.createSubWallet(this.masterWalletId,chainId,0, (data)=>{
      if(data['success']){
        if(!Config.isResregister(this.masterWalletId,chainId)){
          this.registerWalletListener(this.masterWalletId,chainId);
        }
        this.native.hideLoading();
        let coin = this.native.clone(Config.getSubWallet(this.masterWalletId));
        if(coin){
          coin[chainId] = {id:chainId};
        }else{
          coin = {};
          coin[chainId] = {id:chainId};
        }

        let walletObj = this.native.clone(Config.masterWallObj);
        walletObj["id"]   = this.masterWalletId;
        walletObj["wallname"] = Config.getWalletName(this.masterWalletId);
        walletObj["Account"] = Config.getAccountType(this.masterWalletId);
        walletObj["coinListCache"] = coin;
        this.localStorage.saveMappingTable(walletObj).then((data)=>{
          let  mappingList = this.native.clone(Config.getMappingList());
          mappingList[this.masterWalletId] = walletObj;
          Config.setMappingList(mappingList);
        });
      }else{
        this.currentCoin["open"] = false;
        this.native.info(data);
      }
    });
  }

  ionViewDidLeave() {
     this.events.unsubscribe("error:update");
     this.events.unsubscribe("error:destroySubWallet");
  }

  registerWalletListener(masterId,coin){
    this.walletManager.registerWalletListener(masterId,coin,(data)=>{
          //if(!Config.isResregister){
            Config.setResregister(masterId,coin,true);
          //}
           this.events.publish("register:update",masterId,coin,data);
    });
  }

}
