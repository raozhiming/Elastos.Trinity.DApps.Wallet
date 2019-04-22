import {Injectable} from '@angular/core';
import { Storage } from '@ionic/storage';

/***
 * 封装存储操作
 */
@Injectable()
export class LocalStorage {

  constructor(private storage: Storage) { }

  public add(key: string, value: any): any {
    return this.get(key).then((val)=>{
     let id = value['id'];
     if(val === null){
      let initObj = {};
      initObj[id] = value;
      return this.storage.set(key, JSON.stringify(initObj));
     }
     let addObj = JSON.parse(val);
     addObj[id] = value;
     return this.storage.set(key, JSON.stringify(addObj));
    });
  }

  public set(key: string, value: any): any {
    return this.storage.set(key, JSON.stringify(value));
  }

  public get(key: string): any {
    return this.storage.get(key);
  }

  // get seqnumobj by id authtype(bankcard phone idcard enterprise) sign
  //key  id
  //appType kyc  and so on
  //authType  person  company
  public getSeqNumObj(sign : string, id: string,  authType: string, callback : any ): any {

    console.info( "ElastosJs localstorage getSeqNumObj begin sign " + sign + " id "+ id + " authType " + authType);

    /////////////////
    this.get("kycId").then((val)=>{
     let valObj = JSON.parse(val);

     console.info("ElastosJs getSeqNumObj total     valObj " + JSON.stringify(valObj));

      let  idJsonObj = valObj[id];

      //console.info( "ElastosJs localstorage getSeqNumObj idJsonObj " + JSON.stringify(idJsonObj) );

      let  seqNumObj;

      if (idJsonObj &&  idJsonObj[authType] )
      {

        let seqObjs = idJsonObj[authType];

        console.info( "ElastosJs localstorage getSeqNumObj order " + JSON.stringify(seqObjs));

        for(var prop in seqObjs){

          //sign ==
          //console.info( "ElastosJs localstorage prop " + prop);
          //console.info( "ElastosJs localstorage prop " + prop + " order.prop.params " + JSON.stringify(order[prop]["params"]));

          //console.info( "ElastosJs localstorage prop " + prop + " order.prop.params.adata " + JSON.stringify(order[prop]["params"]["adata"]));

          if ( seqObjs[prop]["adata"])
          {
            // var addataArry = [];
            // addataArry = seqObjs[prop]["adata"];

            seqObjs[prop]["adata"].forEach(function (value) {
             // console.info( "ElastosJs value " + JSON.stringify(value) + " typeof value " + typeof (value));
              if (value && value["resultSign"]) {

                console.info( "ElastosJs value[\"retdata\"] " + JSON.stringify(value["retdata"]));
                if (sign == value["resultSign"]) {

                  seqNumObj = seqObjs[prop];
                  console.info( "ElastosJs localstorage getSeqNumObj ok  seqNumObj " + JSON.stringify(seqNumObj));
                }
              }
            })
          }
        }
      }
      callback(seqNumObj);
      //return seqNumObj;

    });
    ////////////////

  }

  public remove(key: string): any {
    return this.storage.remove(key);
  }

  public clear(): any {
    return this.storage.clear();
  }

  public setWallet(value: any): any {
    // TODO
    let key = "ELA-Wallet";
    return this.storage.set(key, JSON.stringify(value));
  }

  public getWallet(): any {
    // TODO
    let key = "ELA-Wallet";
    return this.storage.get(key);
  }

  public addKyc(key: string, value: any):any{
    return this.storage.set(key, JSON.stringify(value));
  }

  public getKycList(key: string):any{
      return this.storage.get(key);
  }

  public getLanguage(key):any{
      return this.storage.get(key);
  }


  public saveCurMasterId(value){
    // {masterId:"123"}
    let key = "cur-masterId";
    return this.storage.set(key, JSON.stringify(value));
  }

  public getCurMasterId(){
    let key = "cur-masterId";
    return this.storage.get(key);
  }

  public saveMappingTable(obj){
     let key = "map-table";
     return this.add(key,obj);
  }

  public getMappingTable(){
    let key = "map-table";
    return this.storage.get(key);
  }


  public setProgress(obj){
      let key = "map-Progress";
      this.storage.set(key,JSON.stringify(obj));
  }

  public getProgress(){
    let key = "map-Progress";
    return this.storage.get(key);
  }

}


