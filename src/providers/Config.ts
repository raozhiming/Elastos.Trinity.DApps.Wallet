import {Injectable} from '@angular/core';
import {Logger} from "../providers/Logger";




/***
 * 封装配置信息
 */
@Injectable()
export class Config {
  public static total = 2;
  public static voted = 1;
  public static deposit = 5000;
  public static isDebug = true;
  public static masterWallObj={id:"",wallname:""};
  public static perObj = {};
  public static masterWalletId:string = "1";
  public static masterWalletList = [];

  public static mappingList = {};

  public static SELA = 100000000;

  //public static BLOCKCHAIN_URL: String = 'https://blockchain.elastos.org/';
    public static BLOCKCHAIN_URL: String = 'https://blockchain-beta.elastos.org/';
  //public static BLOCKCHAIN_URL: String = 'https://blockchain-regtest.elastos.org/';
  private static kycObj:any={};

  private static deviceID:string="";

  private static serIds:any ={};

  private static walletResregister:any ={};

  private static countrys = [{
    "key":"Afghanistan",
    "code": "93"
  }, {
    "key":"Albania",
    "code": "355"
  }, {
    "key": "Algeria",
    "code": "213"
  }, {
    "key": "American Samoa",
    "code": "684"
  }, {
    "key": "Andorra",
    "code": "376"
  }, {
    "key": "Angola",
    "code": "244"
  }, {
    "key": "Anguilla",
    "code": "1264"
  }, {
    "key": "Antarctica",
    "code": "672"
  }, {
    "key": "Antigua and Barbuda",
    "code": "1268"
  }, {
    "key": "Argentina",
    "code": "54"
  }, {
    "key": "Armenia",
    "code": "374"
  }, {
    "key": "Aruba",
    "code": "297"
  }, {
    "key": "Australia",
    "code": "61"
  }, {
    "key": "Austria",
    "code": "43"
  }, {
    "key": "Azerbaijan",
    "code": "994"
  }, {
    "key": "Bahamas",
    "code": "1242"
  }, {
    "key": "Bahrain",
    "code": "973"
  }, {
    "key": "Bangladesh",
    "code": "880"
  }, {
    "key": "Barbados",
    "code": "1246"
  }, {
    "key": "Belarus",
    "code": "375"
  }, {
    "key": "Belgium",
    "code": "32"
  }, {
    "key": "Belize",
    "code": "501"
  }, {
    "key": "Benin",
    "code": "229"
  }, {
    "key": "Bermuda",
    "code": "1441"
  }, {
    "key": "Bhutan",
    "code": "975"
  }, {
    "key": "Bolivia",
    "code": "591"
  }, {
    "key": "Bosnia and Herzegovina",
    "code": "387"
  }, {
    "key": "Botswana",
    "code": "267"
  }, {
    "key": "Brazil",
    "code": "55"
  }, {
    "key": "British Indian Ocean Territory",
    "code": "246"
  }, {
    "key": "Brunei Darussalam",
    "code": "673"
  }, {
    "key": "Bulgaria",
    "code": "359"
  }, {
    "key": "Burkina Faso",
    "code": "226"
  }, {
    "key": "Burundi",
    "code": "257"
  }, {
    "key": "Cambodia",
    "code": "855"
  }, {
    "key": "Cameroon",
    "code": "237"
  }, {
    "key": "Canada",
    "code": "1"
  }, {
    "key": "Cape Verde",
    "code": "238"
  }, {
    "key": "Cayman Islands",
    "code": "1345"
  }, {
    "key": "Central African Republic",
    "code": "236"
  }, {
    "key": "Chad",
    "code": "235"
  }, {
    "key": "Chile",
    "code": "56"
  }, {
    "key": "China",
    "code": "86"
  }, {
    "key": "Christmas Island",
    "code": "61"
  }, {
    "key": "Cocos (Keeling) Islands",
    "code": "61"
  }, {
    "key": "Colombia",
    "code": "57"
  }, {
    "key": "Comoros",
    "code": "269"
  }, {
    "key": "Congo",
    "code": "242"
  }, {
    "key": "Congo, The Democratic Republic Of The",
    "code": "243"
  }, {
    "key": "Cook Islands",
    "code": "682"
  }, {
    "key": "Costa Rica",
    "code": "506"
  }, {
    "key": "Cote D'Ivoire",
    "code": "225"
  }, {
    "key": "Croatia (local name: Hrvatska)",
    "code": "385"
  }, {
    "key": "Cuba",
    "code": "53"
  }, {
    "key": "Cyprus",
    "code": "357"
  }, {
    "key": "Czech Republic",
    "code": "420"
  }, {
    "key": "Denmark",
    "code": "45"
  }, {
    "key": "Djibouti",
    "code": "253"
  }, {
    "key": "Dominica",
    "code": "1767"
  }, {
    "key": "Dominican Republic",
    "code": "1849"
  }, {
    "key": "East Timor",
    "code": "670"
  }, {
    "key": "Ecuador",
    "code": "593"
  }, {
    "key": "Egypt",
    "code": "20"
  }, {
    "key": "El Salvador",
    "code": "503"
  }, {
    "key": "Equatorial Guinea",
    "code": "240"
  }, {
    "key": "Eritrea",
    "code": "291"
  }, {
    "key": "Estonia",
    "code": "372"
  }, {
    "key": "Ethiopia",
    "code": "251"
  }, {
    "key": "Falkland Islands (Malvinas)",
    "code": "500"
  }, {
    "key": "Faroe Islands",
    "code": "298"
  }, {
    "key": "Fiji",
    "code": "679"
  }, {
    "key": "Finland",
    "code": "358"
  }, {
    "key": "France",
    "code": "33"
  }, {
    "key": "France Metropolitan",
    "code": "33"
  }, {
    "key": "French Guiana",
    "code": "594"
  }, {
    "key": "French Polynesia",
    "code": "689"
  }, {
    "key": "Gabon",
    "code": "241"
  }, {
    "key": "Gambia",
    "code": "220"
  }, {
    "key": "Georgia",
    "code": "995"
  }, {
    "key": "Germany",
    "code": "49"
  }, {
    "key": "Ghana",
    "code": "233"
  }, {
    "key": "Gibraltar",
    "code": "350"
  }, {
    "key": "Greece",
    "code": "30"
  }, {
    "key": "Greenland",
    "code": "45"
  }, {
    "key": "Grenada",
    "code": "1473"
  }, {
    "key": "Guadeloupe",
    "code": "590"
  }, {
    "key": "Guam",
    "code": "1671"
  }, {
    "key": "Guatemala",
    "code": "502"
  }, {
    "key": "Guinea",
    "code": "224"
  }, {
    "key": "Guinea-Bissau",
    "code": "245"
  }, {
    "key": "Guyana",
    "code": "592"
  }, {
    "key": "Haiti",
    "code": "509"
  }, {
    "key": "Honduras",
    "code": "504"
  }, {
    "key": "Hong Kong",
    "code": "852"
  }, {
    "key": "Hungary",
    "code": "36"
  }, {
    "key": "Iceland",
    "code": "354"
  }, {
    "key": "India",
    "code": "91"
  }, {
    "key": "Indonesia",
    "code": "62"
  }, {
    "key": "Iran (Islamic Republic of)",
    "code": "98"
  }, {
    "key": "Iraq",
    "code": "964"
  }, {
    "key": "Ireland",
    "code": "353"
  }, {
    "key": "Israel",
    "code": "972"
  }, {
    "key": "Italy",
    "code": "39"
  }, {
    "key": "Jamaica",
    "code": "1876"
  }, {
    "key": "Japan",
    "code": "81"
  }, {
    "key": "Jordan",
    "code": "962"
  }, {
    "key": "Kazakhstan",
    "code": "7"
  }, {
    "key": "Kenya",
    "code": "254"
  }, {
    "key": "Kuwait",
    "code": "965"
  }, {
    "key": "Kyrgyzstan",
    "code": "996"
  }, {
    "key": "Latvia",
    "code": "371"
  }, {
    "key": "Lebanon",
    "code": "961"
  }, {
    "key": "Lesotho",
    "code": "266"
  }, {
    "key": "Liberia",
    "code": "231"
  }, {
    "key": "Libyan Arab Jamahiriya",
    "code": "218"
  }, {
    "key": "Liechtenstein",
    "code": "423"
  }, {
    "key": "Lithuania",
    "code": "370"
  }, {
    "key": "Luxembourg",
    "code": "352"
  }, {
    "key": "Macau",
    "code": "853"
  }, {
    "key": "Madagascar",
    "code": "261"
  }, {
    "key": "Malawi",
    "code": "265"
  }, {
    "key": "Malaysia",
    "code": "60"
  }, {
    "key": "Maldives",
    "code": "960"
  }, {
    "key": "Mali",
    "code": "223"
  }, {
    "key": "Malta",
    "code": "356"
  }, {
    "key": "Marshall Islands",
    "code": "692"
  }, {
    "key": "Martinique",
    "code": "596"
  }, {
    "key": "Mauritania",
    "code": "222"
  }, {
    "key": "Mauritius",
    "code": "230"
  }, {
    "key": "Mayotte",
    "code": "262"
  }, {
    "key": "Mexico",
    "code": "52"
  }, {
    "key": "Micronesia",
    "code": "691"
  }, {
    "key": "Moldova",
    "code": "373"
  }, {
    "key": "Monaco",
    "code": "377"
  }, {
    "key": "Mongolia",
    "code": "976"
  }, {
    "key": "Montenegro",
    "code": "382"
  }, {
    "key": "Montserrat",
    "code": "1664"
  }, {
    "key": "Morocco",
    "code": "212"
  }, {
    "key": "Mozambique",
    "code": "258"
  }, {
    "key": "Myanmar",
    "code": "95"
  }, {
    "key": "Namibia",
    "code": "264"
  }, {
    "key": "Nauru",
    "code": "674"
  }, {
    "key": "Nepal",
    "code": "977"
  }, {
    "key": "Netherlands",
    "code": "31"
  }, {
    "key": "Netherlands Antilles",
    "code": "599"
  }, {
    "key": "New Caledonia",
    "code": "687"
  }, {
    "key": "New Zealand",
    "code": "64"
  }, {
    "key": "Nicaragua",
    "code": "505"
  }, {
    "key": "Niger",
    "code": "227"
  }, {
    "key": "Nigeria",
    "code": "234"
  }, {
    "key": "Norfolk Island",
    "code": "6723"
  }, {
    "key": "North Korea",
    "code": "850"
  }, {
    "key": "Northern Mariana Islands",
    "code": "1670"
  }, {
    "key": "Norway",
    "code": "47"
  }, {
    "key": "Oman",
    "code": "968"
  }, {
    "key": "Pakistan",
    "code": "92"
  }, {
    "key": "Palau",
    "code": "680"
  }, {
    "key": "Palestine",
    "code": "970"
  }, {
    "key": "Panama",
    "code": "507"
  }, {
    "key": "Papua New Guinea",
    "code": "675"
  }, {
    "key": "Paraguay",
    "code": "595"
  }, {
    "key": "Peru",
    "code": "51"
  }, {
    "key": "Philippines",
    "code": "63"
  }, {
    "key": "Pitcairn",
    "code": "64"
  }, {
    "key": "Poland",
    "code": "48"
  }, {
    "key": "Portugal",
    "code": "351"
  }, {
    "key": "Puerto Rico",
    "code": "1787"
  }, {
    "key": "Qatar",
    "code": "974"
  }, {
    "key": "Reunion",
    "code": "262"
  }, {
    "key": "Romania",
    "code": "40"
  }, {
    "key": "Russian Federation",
    "code": "7"
  }, {
    "key": "Rwanda",
    "code": "250"
  }, {
    "key": "Samoa",
    "code": "685"
  }, {
    "key": "San Marino",
    "code": "378"
  }, {
    "key": "Saudi Arabia",
    "code": "966"
  }, {
    "key": "Senegal",
    "code": "221"
  }, {
    "key": "Serbia",
    "code": "381"
  }, {
    "key": "Seychelles",
    "code": "248"
  }, {
    "key": "Sierra Leone",
    "code": "232"
  }, {
    "key": "Singapore",
    "code": "65"
  }, {
    "key": "Slovakia (Slovak Republic)",
    "code": "421"
  }, {
    "key": "Slovenia",
    "code": "386"
  }, {
    "key": "Solomon Islands",
    "code": "677"
  }, {
    "key": "Somalia",
    "code": "252"
  }, {
    "key": "South Africa",
    "code": "27"
  }, {
    "key": "South Korea",
    "code": "82"
  }, {
    "key": "Spain",
    "code": "34"
  }, {
    "key": "Sri Lanka",
    "code": "94"
  }, {
    "key": "Sudan",
    "code": "249"
  }, {
    "key": "Suriname",
    "code": "597"
  }, {
    "key": "Swaziland",
    "code": "268"
  }, {
    "key": "Sweden",
    "code": "46"
  }, {
    "key": "Switzerland",
    "code": "41"
  }, {
    "key": "Syrian Arab Republic",
    "code": "963"
  }, {
    "key": "Taiwan",
    "code": "886"
  }, {
    "key": "Tajikistan",
    "code": "992"
  }, {
    "key": "Tanzania",
    "code": "255"
  }, {
    "key": "Thailand",
    "code": "66"
  }, {
    "key": "Togo",
    "code": "228"
  }, {
    "key": "Tokelau",
    "code": "690"
  }, {
    "key": "Tonga",
    "code": "676"
  }, {
    "key": "Trinidad and Tobago",
    "code": "1868"
  }, {
    "key": "Tunisia",
    "code": "216"
  }, {
    "key": "Turkey",
    "code": "90"
  }, {
    "key": "Turkmenistan",
    "code": "993"
  }, {
    "key": "Turks and Caicos Islands",
    "code": "1809"
  }, {
    "key": "Tuvalu",
    "code": "688"
  }, {
    "key": "Uganda",
    "code": "256"
  }, {
    "key": "Ukraine",
    "code": "380"
  }, {
    "key": "United Arab Emirates",
    "code": "971"
  }, {
    "key": "United Kingdom",
    "code": "44"
  }, {
    "key": "United States",
    "code": "1"
  }, {
    "key": "Uruguay",
    "code": "598"
  }, {
    "key": "Uzbekistan",
    "code": "998"
  }, {
    "key": "Vanuatu",
    "code": "678"
  }, {
    "key": "Vatican City State (Holy See)",
    "code": "39"
  }, {
    "key": "Venezuela",
    "code": "58"
  }, {
    "key": "Vietnam",
    "code": "84"
  }, {
    "key": "Virgin Islands (British)",
    "code": "1284"
  }, {
    "key": "Virgin Islands (U.S.)",
    "code": "1340"
  }, {
    "key": "Wallis And Futuna Islands",
    "code": "681"
  }, {
    "key": "Western Sahara",
    "code": "685"
  }, {
    "key": "Yemen",
    "code": "967"
  }, {
    "key": "Yugoslavia",
    "code": "381"
  }, {
    "key": "Zambia",
    "code": "260"
  }, {
    "key": "Zimbabwe",
    "code": "263"
  }, {
    "key": "the Republic of Abkhazia",
    "code": "7"
  }, {
    "key": "the Republic of South Ossetia",
    "code": "7"
  }, {
    "key": "Bailiwick of Jersey",
    "code": "44"
  }, {
    "key": "Lao People's Democratic Republic",
    "code": "856"
  }, {
    "key": "The Republic of Macedonia",
    "code": "389"
  }, {
    "key": "The Federation of Saint Kitts and Nevis",
    "code": "1869"
  }, {
    "key": "Santa Luzia Island",
    "code": "1758"
  }, {
    "key": "Saint Vincent and the Grenadines",
    "code": "1784"
  }, {
    "key": "Sao Tome and Principe",
    "code": "239"
  }, {
    "key": "Saint-Martin",
    "code": "590"
  }, {
    "key": "The Republic of South Sudan",
    "code": "211"
  }];

  public static getKycObj(){
       return this.kycObj;
  }

  public static setKycObj(obj){
        this.kycObj = obj;
  }

  public static setDeviceID(deviceID){
       this.deviceID = deviceID;
  }

  public static getdeviceID(){
        return this.deviceID;
  }

  public static getSerIds(){
         return this.serIds;
  }

  public static setSerIds(serIds){
        console.info("Elastjs setSerIds serIds " + JSON.stringify(serIds));
        this.serIds = serIds;
  }

 public static add(idObj,newIds,id,path){
  for(let index in idObj[id][path]){
   let data = idObj[id][path][index];
   newIds[index] ={"id":id,"path":path,"serialNum":data["serialNum"],"txHash":data["txHash"]};
  }
}

 public static getSertoId(ids){
  let newIds = {};
          for(let key in ids){
             let id =  key;
             let idObj = ids[id];
             let path = "enterprise";
               if(idObj[path]){
                 this.add(ids,newIds,id,path);
                }

             path = "identityCard";
               if(idObj[path]){
                 this.add(ids,newIds,id,path);
               }

                path = "phone";
               if(idObj[path]){
                 this.add(ids,newIds,id,path);

               }

               path = "bankCard";
               if(idObj[path]){
                 this.add(ids,newIds,id,path);

               }
          }

          return newIds;
  }


  public static getCurMasterWalletId(){
            return this.masterWalletId;
  }

  public static setCurMasterWalletId(masterWalletId){
       this.masterWalletId = masterWalletId;
  }

  public static getMasterWalletIdList(){
          return this.masterWalletList;
  }

  public static setMasterWalletIdList(masterWalletList){
          this.masterWalletList = masterWalletList;
  }



  public static uuid(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    radix = radix || chars.length;

    if (len) {
     // Compact form
     for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
     // rfc4122, version 4 form
     var r;

     // rfc4122 requires these characters
     uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
     uuid[14] = '4';

     // Fill in random data. At i==19 set the high bits of clock sequence as
     // per rfc4122, sec. 4.1.5
     for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
       r = 0 | Math.random()*16;
       uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
     }
    }

    return uuid.join('');
  }


  public static setMasterPer(masterId,coin,per){
      if(this.perObj[masterId]){
        this.perObj[masterId][coin] = per;
      }else{
         this.perObj[masterId] = {};
         this.perObj[masterId][coin] = per;
      }


  }

  public static getMasterPer(masterId,coin){

    if(this.perObj[masterId]){
      return this.perObj[masterId][coin] || 0;
    }else{
         return 0;
    }
  }

  public static setMappingList(list){
      this.mappingList = list;
  }

  public static getMappingList(){
       return this.mappingList;
  }

  public static objtoarr(obj){
    let arr = [];
    for (let key in obj) {
      arr.push(obj[key]);
    }
    return arr;
  }

  public static getWalletName(id){
          return this.mappingList[id]["wallname"] || "";
  }

  public static setWalletName(id,walletname){
    this.mappingList[id]["wallname"] = walletname;
  }

  public static getSubWallet(id){
          return this.mappingList[id]["coinListCache"] || null;
  }

  public static isResregister(id,coin){
          if(this.walletResregister[id]){
              if(this.walletResregister[id][coin]){
                return this.walletResregister[id][coin];
              }else{
                return false;
              }

          }else{
                return false;
          }
  }

  public static setResregister(id,coin,isOpen){
        if(this.walletResregister[id]){
          this.walletResregister[id][coin] = isOpen;
        }else{
          this.walletResregister[id] = {};
          this.walletResregister[id][coin] = isOpen;
        }

  }

 public static getAccountType(masterWalletId){
  return this.mappingList[masterWalletId]["Account"] || {};
 }


 public static getEstimatedHeight(masterId,coin){
  if(this.perObj[masterId]){
    if(this.perObj[masterId][coin]){
          if(this.perObj[masterId][coin]["maxHeight"]){
                   return this.perObj[masterId][coin]["maxHeight"];
          }else{
            return 0;
          }
    }else{
       return 0;
    }

  }else{
       return 0;
  }
 }

 public static setEstimatedHeight(masterId,coin,estimatedHeight){
  if(this.perObj[masterId]){
      if(this.perObj[masterId][coin]){
        this.perObj[masterId][coin]["maxHeight"] = estimatedHeight;
      }else{
        this.perObj[masterId][coin] = {};
        this.perObj[masterId][coin]["maxHeight"] = estimatedHeight;
      }
  }else{
     this.perObj[masterId] = {};
     if(this.perObj[masterId][coin]){
       this.perObj[masterId][coin]["maxHeight"] = estimatedHeight;
     }else{
        this.perObj[masterId][coin] = {};
        this.perObj[masterId][coin]["maxHeight"] = estimatedHeight;
     }
  }
}

public static getCurrentHeight(masterId,coin){
  if(this.perObj[masterId]){
    if(this.perObj[masterId][coin]){
          if(this.perObj[masterId][coin]["curHeight"]){
                   return this.perObj[masterId][coin]["curHeight"];
          }else{
            return 0;
          }
    }else{
       return 0;
    }

  }else{
       return 0;
  }
}

public static setCureentHeight(masterId,coin,currentHeight){
  if(this.perObj[masterId]){
    if(this.perObj[masterId][coin]){
      this.perObj[masterId][coin]["curHeight"] = currentHeight;
    }else{
      this.perObj[masterId][coin] = {};
      this.perObj[masterId][coin]["curHeight"] = currentHeight;
    }
}else{
   this.perObj[masterId] = {};
   if(this.perObj[masterId][coin]){
     this.perObj[masterId][coin]["curHeight"] = currentHeight;
   }else{
      this.perObj[masterId][coin] = {};
      this.perObj[masterId][coin]["curHeight"] = currentHeight;
   }
}
}


public static getAllCountry(){
       return this.countrys;
}

public static getCountryByCode(code){

  for(let index in this.countrys){
      let item = this.countrys[index];
      if(code === parseInt(item["code"])){
        return item["key"];
      }
    }
    return "Unknown";
}


public static accMul(arg1,arg2)
{
let m=0,s1=arg1.toString(),s2=arg2.toString();
try{m+=s1.split(".")[1].length}catch(e){}
try{m+=s2.split(".")[1].length}catch(e){}
return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m)
}

public static getNickname(ownerpublickey,voteList){
	for(let index = 0;index<voteList.length;index++){
		     let item = voteList[index];
		     if(ownerpublickey === item["ownerpublickey"]){
		     	return item["nickname"];
		     }
	}

	return "";
}

}


