import { Component,ViewChild} from '@angular/core';
import {IdImportComponent} from "../../../pages/id/import/import";
import {IdManagerComponent} from "../../../pages/id/manager/manager";
import {TabsComponent} from "../../../pages/tabs/tabs.component";
import { Config } from '../../../providers/Config';
import {PathlistPage} from '../../../pages/id/pathlist/pathlist';
import {IDManager} from "../../../providers/IDManager";
import { NavController, NavParams,Events,Navbar} from 'ionic-angular';
import {WalletManager} from '../../../providers/WalletManager';
import {Native} from "../../../providers/Native";
import {LocalStorage} from "../../../providers/Localstorage";
import {DataManager} from "../../../providers/DataManager";
import {Util} from "../../../providers/Util";
@Component({
  selector: 'id-home',
  templateUrl: 'home.html',
})
export class IdHomeComponent{
  public kycIdArr:any;
  @ViewChild(Navbar) navBar: Navbar;
  constructor(public navCtrl: NavController,public navParams: NavParams,public native :Native,public walletManager :WalletManager,public localStorage: LocalStorage,public events: Events,public dataManager :DataManager){
          this.init();
  }

  ionViewDidLoad() {
    this.navBar.backButtonClick = (e)=>{
      this.native.setRootRouter(TabsComponent);
    };
  }
  init(){
    var self = this;
    this.localStorage.get("kycId").then((val)=>{

             let seqNumJsonObj = JSON.parse(val);
             this.kycIdArr = Util.objtoarr(seqNumJsonObj);

             console.info("ElastosJs IdHomeComponent val" + val);
             self.initSeqObj(seqNumJsonObj);

             this.kycIdArr.forEach(function(e){
               console.info("ElastosJs IdHomeComponent e.id registerIdListener begin  " + e.id);
               self.walletManager.registerIdListener(e.id, (data) => {

                 console.info("home.ts ElastosJs ngOnInit registerIdListener data "+ JSON.stringify(data));
                 //alert("home.ts createDID registerIdListener  data  callback"+ JSON.stringify(data));
                 //first commit
                 if(data["path"] == "Added"){

                   let valueObj = JSON.parse(data["value"]) ;

                   console.info("home.ts ElastosJs ngOnInit registerIdListener valueObj "+ JSON.stringify(valueObj));
                   //console.info("home.ts ElastosJs ngOnInit registerIdListener valueObj[\"Contents\"].length  "+ valueObj["Contents"].length);
                   //console.info("home.ts ElastosJs ngOnInit registerIdListener Proof "+ valueObj["Contents"][0]["Values"][0]["Proof"] );

                   if((valueObj["Contents"].length > 0) && (valueObj["Contents"][0]["Values"].length > 0) && valueObj["Contents"][0]["Values"][0]["Proof"] ){

                     let proofObj = JSON.parse(valueObj["Contents"][0]["Values"][0]["Proof"] );

                     console.info("home.ts ElastosJs ngOnInit proofObj[\"signature\"]  "+ proofObj["signature"]);
                     let seqNumObj = self.dataManager.getSeqNumObj(proofObj["signature"]);

                     let serialNum =  seqNumObj["serialNum"] ;
                     console.info("home.ts ElastosJs ngOnInit serialNum "+ serialNum);
                     self.setOrderStatus(5,serialNum);

                     ////

                     //let  idJson = self.dataManager.OutPutIDJson(data.id, valueObj["Contents"][0]["Path"], proofObj["signature"]);
                     let  idJson = self.dataManager.OutPutIDJson(data.id, valueObj["Contents"][0]["Path"], proofObj["signature"]);
                     self.testDataHash(idJson);
                     ////


                    // self.dataManager.addIdPathJson(data.id, valueObj["Contents"][0]["Path"], valueObj);
                   }
                 }
                 //alert("home.ts createDID registerIdListener ngOnInit data  callback"+ JSON.stringify(data));
                 //console.info("home.ts ElastosJs createDID registerIdListener " + JSON.stringify(data));

                 console.info("home.ts ElastosJs ngOnInit registerIdListener  data  callback !!!!!" + JSON.stringify(data));

               });
               console.info("ElastosJs IdHomeComponent e.id  end registerIdListener" + e.id);
              });


    });

    this.events.subscribe('idhome:update', () => {
      this.localStorage.get("kycId").then((val)=>{
        this.kycIdArr = Util.objtoarr(JSON.parse(val));
      });
    });
  }

  testDataHash(IDJsonObj){

    // let IDJsonObj = {
    //   "Id": "ihWrYTvJ4FYHBuQ5mwmTNTVXenSfvWHDy9",
    //   "Path": "kyc/enterprise",
    //   "SignContent": {
    //     "type": "enterprise",
    //     "result": "success",
    //     "retdata": {
    //       "app": "b1c0b7028c8c4be3beafc4c4812ae92e",
    //       "signature": "4a2e50905a55e1b6156410e360c083c0a85cad0ef1f089d8a6eea87a8f1e225d74cefcaea92c69ad7c4a77c53dccc4b5fa090019200e5fda4c505ba4eccbc612",
    //       "RegistrationNum": "911101080804655794",
    //       "legalPerson": "詹克团",
    //       "word": "北京比特大陆科技有限公司",
    //       "authid": "12345678",
    //       "ts": "1535103449"
    //     },
    //     "message": "认证成功",
    //     "timestamp": "1535103453088"
    //   },
    //   "DataHash": [{
    //     "hash": "7f6d1d62480d06e939999f33cc9f3802602236dccfb8243a2e74176b9fb905ab",
    //     "KycContent": {
    //       "word": "北京比特大陆科技有限公司",
    //       "legalPerson": "詹克团",
    //       "registrationNum": "911101080804655794"
    //     },
    //     "Proof": "{\"signature\":\"3046022100fb11acd29f09ca0b3d7d64d3baa1eb462aa31ecbf6e36d2950ea75d22b349793022100ee3e38132242a229e093b7ec10305b5104a35c0cdc2c30c8230524eabbfeb32c\",\"notary\":\"COOIX\"}"
    //   }]
    // };

    let DataHashArry =IDJsonObj["DataHash"];
    let DataHashElement = DataHashArry[0];
    console.info("Elastjs testDataHash DataHashElement " + JSON.stringify(DataHashElement));

    let valueObj = {};
    valueObj["Proof"] = DataHashElement["Proof"];


    let kycContent = DataHashElement["KycContent"];

    console.info("Elastjs testDataHash kycContent " + JSON.stringify(kycContent));
    console.info("Elastjs testDataHash valueObj[\"proof\"] " + valueObj["Proof"]);


    let authDataHash = IDManager.hash(JSON.stringify(kycContent)+valueObj["Proof"]);

    valueObj["DataHash"] = IDManager.hash(authDataHash+valueObj["Proof"]);

    console.info("ElastJs testDataHash DataHash " + valueObj["DataHash"] + " targetHash " + IDJsonObj["DataHash"][0]["hash"]);
  }

  initSeqObj(allStoreSeqNumJsonObj){
    console.info("ElastosJs initSeqObj begin allStoreSeqNumJsonObj" + JSON.stringify(allStoreSeqNumJsonObj));
    var self = this;

    let ids = allStoreSeqNumJsonObj;
    for(let id in ids){
      let  idJsonObj = ids[id];
      if (! idJsonObj["kyc"]){
        continue;
      }

      for (let authType in idJsonObj["kyc"]){
        if (!idJsonObj["kyc"][authType]["order"]){
          continue
        }
        let order = idJsonObj["kyc"][authType]["order"];

        for (let prop in order) {

          if ( order[prop]["params"] && order[prop]["params"]["adata"])
          {
            var addataArry = [];
            addataArry = order[prop]["params"]["adata"];
            addataArry.forEach(function (value) {
              if (value && value["retdata"]) {
                if ( value["retdata"]["signature"]) {
                  let sign = value["retdata"]["signature"];
                  self.dataManager.addSeqNumObj(sign, order[prop] );
                 //console.info( "ElastosJs add sign " + sign + " obj "+ JSON.stringify(order[prop]));
                }
              }
            })
          }
        }
      }
    }
    console.info("ElastosJs initSeqObj end ");
  }

  onNext(type){
    switch (type){
      case 0:
        this.createDID();
        break;
      case 1:
        this.native.Go(this.navCtrl,IdImportComponent);
        break;
      case 2:
      this.native.Go(this.navCtrl,IdManagerComponent);
        break;
    }
  }

  onItem(item){
     //this.Go(IdAppListComponent,{"id":item.id});
     this.native.Go(this.navCtrl,PathlistPage,{"id":item.id});
  }

  createDID(){

    this.walletManager.createDID("s12345678",(result)=>{
      let idObj ={id:result.didname};
      let self = this;
      this.walletManager.registerIdListener(result.didname, (data) => {

        console.info("home.ts ElastosJs createDID registerIdListener "+ JSON.stringify(data));
        //alert("home.ts createDID registerIdListener  data  callback"+ JSON.stringify(data));
        //first commit
        if(data["path"] == "Added"){

          let valueObj = JSON.parse(data["value"]) ;
          if((valueObj["Contents"].length > 0) && (valueObj["Contents"][0]["Values"].length > 0) && valueObj["Contents"][0]["Values"][0]["Proof"] ){

            let proofObj = JSON.parse(valueObj["Contents"][0]["Values"][0]["Proof"]);

            console.info("home.ts ElastosJs createDID proofObj[\"signature\"]  "+ proofObj["signature"]);
            let seqNumObj = self.dataManager.getSeqNumObj(proofObj["signature"]);

            let serialNum =  seqNumObj["serialNum"] ;
            console.info("home.ts ElastosJs createDID serialNum "+ serialNum);
            self.setOrderStatus(5,serialNum);

            let  idJson = self.dataManager.OutPutIDJson(data.id, valueObj["Contents"][0]["Path"], proofObj["signature"]);

            self.testDataHash(idJson);
            //self.dataManager.addIdPathJson(data.id, valueObj["Contents"][0]["Path"], valueObj);
            //self.dataManager.addSignCont();

            //alert("home.ts createDID registerIdListener  data  callback"+ JSON.stringify(data));

            /*for(let ele of valueObj["Contents"]){
              //get value

              let proofObj = JSON.parse(ele["Proof"])

              //newSeqNumObj这里可能有多个 提交的。 要找到path对应的那个
              let newSeqNumObj = self.dataManager.getSeqNumObj(proofObj["signature"]);

              //遍历result中的proof 找到对应的seqNumObj 比较这两个seqNumObj中的关键字。如果相同则先删除后添加。
              //否则添加
              self.walletManager.didGetValue(data["id"] , ele["Path"] ,(result)=>{

              })
              //check duplicate

              //setvalue
            }*/
            //

          }
        }

        //console.info("home.ts ElastosJs createDID registerIdListener " + JSON.stringify(data));

        console.info("home.ts ElastosJs createDID registerIdListener  data  callback !!!!!" + JSON.stringify(data));


      });


      this.localStorage.add("kycId",idObj).then(()=>{
           this.kycIdArr.push({id:result.didname});
      });
    });
  }


  getDID(){
    this.walletManager.getDIDList((result)=>{
      this.kycIdArr = JSON.parse(result["list"]);
    });
  }

  setOrderStatus(status,serialNum){

    console.info("ElastJs setOrderStatus begin status " + status +" serialNum " + serialNum);

    let serids = Config.getSerIds();
    let serid = serids[serialNum];

    console.info("ElastJs setOrderStatus serid " + JSON.stringify(serid));
    console.info("ElastJs setOrderStatus serids " + JSON.stringify(serids));

    let did = serid["id"];
    let path = serid["path"];
    console.info("ElastJs setOrderStatus appr " + path);

    let idsObj = {};
    this.localStorage.getKycList("kycId").then((val)=>{

      console.info("ElastJs setOrderStatus getKycList " + val);
        if(val == null || val === undefined || val === {} || val === ''){
          console.info("ElastJs setOrderStatus getKycList err return ");

          return;
        }
     idsObj = JSON.parse(val);

      console.info("ElastJs setOrderStatus before chg status did "+ did + " path "+path + " serialNum "+ serialNum + " status "+ status);

      idsObj[did][path][serialNum]["pathStatus"] = status;

     this.localStorage.set("kycId",idsObj).then(()=>{
          this.events.publish("order:update",status,path);
       console.info("ElastJs setOrderStatus pulish order ");

     });
    });
}
}
