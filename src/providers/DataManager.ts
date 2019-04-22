import {Injectable} from '@angular/core';





/***
 * 封装配置信息
 */
@Injectable()
export class DataManager {

  //map key is signature value is jsonObj (with seqnum and so on)
  public  SignSeqNumObjetMap = {};

  // ID all three Path Json
  public  idPathJson = {};

  //key is proof signature, value is  kyc auth content
  public  kycSignCont = {}


  public  addIdPathJson(Id: string, Path : string , objJson : any){

    if (!this.idPathJson[Id]){
      this.idPathJson[Id] = {};
    }

    console.info("ElastosJs DataManager addIdPathJson Id "+ Id +" Path" + Path + "objJson "+ JSON.stringify(objJson));

    if (!this.idPathJson[Id][Path]){
      this.idPathJson[Id][Path] =[]
    }
    this.idPathJson[Id][Path].push(objJson);
    console.info("ElastosJs DataManager addIdPathJson end Id "+ Id +" Path" + Path + "objJson "+ JSON.stringify(objJson));

  }


  public  getIdPathJson(Id: string, Path : string ){

    let jsonObj = {};
    console.info("ElastosJs DataManager getIdPathJson begin Id "+ Id +" Path" + Path );

    if (this.idPathJson[Id]){
      jsonObj = this.idPathJson[Id][Path];
    }
    console.info("ElastosJs DataManager getIdPathJson end jsonObj "+ JSON.stringify(jsonObj) );

    return jsonObj;
  }

  public OutPutIDJson(Id: string, Path : string , signature: string){
    let idJson = {};

    let jsonObj = this.getIdPathJson(Id, Path);

    //if( (jsonObj["Contents"].length > 0) && (jsonObj["Contents"][0]["Values"].length > 0)){
      //let proofObj = JSON.parse(jsonObj["Contents"][0]["Values"][0]["Proof"] );
      let signCont = this.getSignCont(signature)

      idJson["Id"] = Id;
      idJson["Path"] = Path;
      idJson["SignContent"] = signCont;
      //idJson["DataHash"] = [];

      idJson["DataHash"] = (jsonObj)

      console.info("Elastjs OutPutIDJson " + JSON.stringify(idJson));
      return idJson;
    //}

  }

  public  addSignCont(sign: string , cont : any){
    console.info("ElastosJs DataManager addSignCont sign "+ sign + "cont "+ JSON.stringify(cont));

    this.kycSignCont[sign] = cont;
  }

  public  getSignCont(sign: string){
    console.info("ElastosJs DataManager getSignCont sign "+ sign + "obj "+ JSON.stringify(this.kycSignCont[sign]));

    return this.kycSignCont[sign];
  }


  //add obj
  public  addSeqNumObj(sign :string , obj : any ){
    console.info("ElastosJs DataManager addSeqNumObj sign "+ sign + "obj "+ JSON.stringify(obj));

    this.SignSeqNumObjetMap[sign] = obj;
  }

  //get object
  public  getSeqNumObj(sign : string){
    console.info("ElastosJs DataManager getSeqNumObj sign "+ sign + "obj "+ JSON.stringify(this.SignSeqNumObjetMap[sign]));
    return this.SignSeqNumObjetMap[sign];
  }



}


