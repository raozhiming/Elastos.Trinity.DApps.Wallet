import { Component} from '@angular/core';
import {IdImportComponent} from "../../../pages/id/import/import";
import {IdHomeComponent} from "../../../pages/id/home/home";
import {Config} from "../../../providers/Config";
import { NavController, NavParams,Events } from 'ionic-angular';
import {WalletManager} from '../../../providers/WalletManager';
import {Native} from "../../../providers/Native";
import {LocalStorage} from "../../../providers/Localstorage";
import {DataManager} from "../../../providers/DataManager";

@Component({
  selector: 'id-launcher',
  templateUrl: 'launcher.html',
})
export class IdLauncherComponent{

  constructor(public navCtrl: NavController,public navParams: NavParams,public native :Native,public walletManager :WalletManager,public localStorage: LocalStorage,public events: Events,public dataManager :DataManager){

  }
  onNext(type){
    switch (type){
      case 0:
        this.createId();
        break;
      case 1:
        this.native.Go(this.navCtrl,this,IdImportComponent);
        break;
    }
  }

  createId(){
    let self = this;
    this.walletManager.createDID("s12345678",(result)=>{

          let idObj ={id:result.didname};


          console.info("ElastosJs luncher.ts createDID result add registerIdListener" + JSON.stringify(result));
          self.walletManager.registerIdListener(result.didname, (data) => {

            console.info("lacucher.ts ElastosJs createDID registerIdListener "+ JSON.stringify(data));
            //alert("home.ts createDID registerIdListener  data  callback"+ JSON.stringify(data));
            //first commit
            if(data["path"] == "Added"){

              let valueObj = JSON.parse(data["value"]) ;
              if((valueObj["Contents"].length > 0) && (valueObj["Contents"][0]["Values"].length > 0) && valueObj["Contents"][0]["Values"][0]["Proof"] ){

                let proofObj = JSON.parse(valueObj["Contents"][0]["Values"][0]["Proof"]);

                console.info("lacucher.ts ElastosJs createDID proofObj[\"signature\"]  "+ proofObj["signature"]);
                let seqNumObj = self.dataManager.getSeqNumObj(proofObj["signature"]);

                let serialNum =  seqNumObj["serialNum"] ;
                console.info("lacucher.ts ElastosJs createDID serialNum "+ serialNum);
                self.setOrderStatus(5,serialNum);
                self.dataManager.OutPutIDJson(data.id, valueObj["Contents"][0]["Path"], proofObj["signature"]);
                //self.dataManager.addIdPathJson(data.id, valueObj["Contents"][0]["Path"], valueObj);
               // alert("lacucher.ts createDID registerIdListener  data  callback"+ JSON.stringify(data));
              }
            }
            //console.info("home.ts ElastosJs createDID registerIdListener " + JSON.stringify(data));

            console.info("lacucher.ts ElastosJs createDID registerIdListener  data  callback !!!!!" + JSON.stringify(data));


          });
          this.localStorage.add("kycId",idObj).then(()=>{
               this.native.Go(this.navCtrl,IdHomeComponent);
          });
    })
  }

  setOrderStatus(status,serialNum){

    console.info("setOrderStatus begin status " + status +" serialNum " + serialNum);

    let serids = Config.getSerIds();
    let serid = serids[serialNum];

    console.info("setOrderStatus serid" + JSON.stringify(serid));
    console.info("setOrderStatus serids" + JSON.stringify(serids));

    let did = serid["id"];
    let path = serid["path"];
    console.info("setOrderStatus appr" + path);

    let idsObj = {};
    this.localStorage.getKycList("kycId").then((val)=>{
        if(val == null || val === undefined || val === {} || val === ''){
             return;
        }
     idsObj = JSON.parse(val);
     idsObj[did][path][serialNum]["pathStatus"] = status;
     this.localStorage.set("kycId",idsObj).then(()=>{
          this.events.publish("order:update",status,path);
     });
    });
}

}


