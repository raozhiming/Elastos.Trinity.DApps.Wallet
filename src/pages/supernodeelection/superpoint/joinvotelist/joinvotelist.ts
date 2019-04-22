import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ModalController} from 'ionic-angular';
import {Native} from "../../../../providers/Native";
import {ApiUrl} from "../../../../providers/ApiUrl";
/**
 * Generated class for the JoinvotelistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-joinvotelist',
  templateUrl: 'joinvotelist.html',
})
export class JoinvotelistPage {

  public nodelist = [];
  public myInterval:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,public modalCtrl: ModalController,public native: Native) {
      //this.init();
  }


  init(){
    this.getVoteList();
  }
  ionViewDidLoad() {

  }

  ionViewWillEnter(){
    this.init();
    this.myInterval = setInterval(()=>{
        this.init();
    },60000);
  }

 ionViewDidLeave(){
  clearInterval(this.myInterval);
 }

  votingRules(){
      this.openPayModal();
  }

  myvote(){
    this.native.Go(this.navCtrl,'MyvotePage');
  }

  tovote(){
    this.native.Go(this.navCtrl,'PointvotePage');
  }

  openPayModal(){
    const modal = this.modalCtrl.create("VotingrulesPage",{});
    modal.onDidDismiss(data => {
      if(data){
      }
    });
    modal.present();
  }

  jumpNodeInformation(item){
    this.native.info(item);
    this.native.Go(this.navCtrl,'NodeinformationPage',{"info":item});
  }


  getVoteList(){
    this.native.getHttp().postByAuth(ApiUrl.listproducer).toPromise().then(data=>{
           if(data["status"] === 200){
               this.native.info(data);
               let votesResult = JSON.parse(data["_body"]);
               if(votesResult["code"] === "0"){
                this.native.info(votesResult);
                this.nodelist = votesResult["data"]["result"]["producers"] || [];
               }
             }
    });
  }

}
