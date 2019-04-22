import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Native } from '../../../../providers/Native';
import {WalletManager} from '../../../../providers/WalletManager';
import { Config } from '../../../../providers/Config';
import {ApiUrl} from "../../../../providers/ApiUrl";
/**
 * Generated class for the MyvotePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-myvote',
  templateUrl: 'myvote.html',
})
export class MyvotePage {
    public masterWalletId:string = "1";
    public walletName:string ="";
    public totalNum = 1100;
    public voteList = [];
    public selectNode = [];
  constructor(public navCtrl: NavController, public navParams: NavParams,public native: Native,public walletManager: WalletManager) {
    this.masterWalletId = Config.getCurMasterWalletId();
    this.walletName = Config.getWalletName(this.masterWalletId);
    this.init();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MyvotePage');
  }

  changevote(){
      console.log("============="+JSON.stringify(this.selectNode));
      this.native.Go(this.navCtrl,"PointvotePage",{"selectNode":this.selectNode});
  }

  getVotedProducerList(list){
    // let productList = JSON.parse("{\"03b273e27a6820b55fe5a6b7a445814f7c1db300e961661aaed3a06cbdfd3dca5d\":110000000}");
    // this.selectNode = this.objtoArr(productList);
    // this.voteList = this.getVoteList(productList,list);
    this.walletManager.getVotedProducerList(this.masterWalletId,"ELA",(data)=>{
      if(data["success"]){
        this.native.info(data);
        let productList = JSON.parse(data["success"]);
        this.selectNode = this.objtoArr(productList);
        this.voteList = this.getVoteList(productList,list);
      }
    });
  }


  init(){
    this.native.getHttp().postByAuth(ApiUrl.listproducer).toPromise().then(data=>{
      if(data["status"] === 200){
          this.native.info(data);
          let votesResult = JSON.parse(data["_body"]);
          if(votesResult["code"] === "0"){
           this.native.info(votesResult);
           let list = votesResult["data"]["result"]["producers"] || [];
           this.getVotedProducerList(list);
          }
        }
  });
  }



 objtoArr(obj){
	  let arr = [];
	  for(let key in obj){
          arr.push(key);
	  }
    return arr;
  }


  getVoteList(obj,list){
    let arr = [];
    for(let key in obj){
      let name = Config.getNickname(key,list);
      if(name != ""){
        let item ={"name":name,"votes":obj[key]/Config.SELA};
        arr.push(item);
      }
    }
    return arr;
  }
}
