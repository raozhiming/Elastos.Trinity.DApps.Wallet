import { Component} from '@angular/core';
import {WalletManager} from '../../providers/WalletManager';


@Component({
  selector: 'app-testjni',
  templateUrl: './testjni.component.html',
})
export class TestJniComponent {
  masterWalletId:string ="1";
  phrasePassword:string ="66666666";
  newPassword:string ="66666666";
  payPassword:string ="66666666";
  backupPassword:string="66666666";
  keystoreContent:string ="ssssss";
  mnemonic:string ="sssssss";
  language:string ="english";
  singMessage:string;
  fromAddress:string="sssss";
  toAddress:string="EWs2TgP4Ds3qZcTzWmBZ5hNsx2PaEyxbui";
  chinaId:string ="ELA";
  adress:string;
  toadress:string="EWs2TgP4Ds3qZcTzWmBZ5hNsx2PaEyxbui";
  did:string;
  signature:string;
  unit:number = 100000000;
  rawTransaction:string="sss";
  transactionJson:string;
  fee:number;
  interfaces = [

                {id:24,name:"generateMnemonic"},
                {id:3,name:"createMasterWallet"},
                {id:0,name:"createSubWallet"},
                {id:9,name:"createAddress"},
                {id:41,name:"createTransaction"},
                {id:42,name:"calculateTransactionFee"},
                {id:43,name:"sendRawTransaction"},
                {id:30,name:"createDID"},
                {id:31,name:"getDIDList"},
                {id:32,name:"destoryDID"},
                {id:33,name:"didSetValue"},
                {id:34,name:"didGetValue"},
                {id:35,name:"didGetHistoryValue"},
                {id:37,name:"didGetAllKeys"},
                {id:38,name:"didSign"},
                {id:39,name:"didCheckSign"},
                {id:40,name:"didGetPublicKey"},
                {id:28,name:"getSupportedChains"},
                {id:8,name:"getBalance"},
                {id:29,name:"changePassword"},
                {id:19,name:"getAllMasterWallets"},
                {id:1,name:"recoverSubWallet"},
                {id:4,name:"importWalletWithKeystore"},
                {id:5,name:"importWalletWithMnemonic"},
                {id:6,name:"exportWalletWithKeystore"},
                {id:10,name:"getAllAddress"},
                {id:11,name:"getBalanceWithAddress"},
                {id:13,name:"generateMultiSignTransaction"},
                {id:14,name:"getAllTransaction"},
                {id:15,name:"registerWalletListener"},
                {id:16,name:"checkSign"},
                {id:17,name:"sing"},
                {id:18,name:"deriveIdAndKeyForPurpose"},
                {id:20,name:"destroyWallet"},
                {id:21,name:"isAddressValid"},
                {id:22,name:"getBalanceInfo"},
                {id:25,name:"saveConfigs"},
                {id:26,name:"getWalletId"},
                {id:27,name:"getAllChainIds"},
                {id:7,name:"exportWalletWithMnemonic"},
              ];
  constructor(public walletManager:WalletManager){

  }

  onNext(type): void {
     switch (type){
      case 41:
          this.createTransaction();
          break;
      case 42:
          this.calculateTransactionFee();
          break;
      case 43:
          this.sendRawTransaction();
          break;
      case 40:
         this.didGetPublicKey();
         break;
      case 39:
          this.didCheckSign();
           break;
      case 38:
          this.didSign();
          break;
      case 37:
        this.didGetAllKeys();
      break;
      case 35:
           this.didGetHistoryValue();
           break;
      case 34:
          this.didGetValue();
      case 33:
            this.didSetValue();
          break;
      case 30:
          this.createDID();
          break;
      case 31:
          this.getDIDList();
        break;
      case 32:
          this.destoryDID(this.did);
        break;
       case 0:
         this.createSubWallet(this.chinaId);
         break;
       case 1:
         this.recoverSubWallet();
         case 3:
         this.createMasterWallet(this.masterWalletId,this.mnemonic,this.phrasePassword,this.payPassword);
        break;
       case 4:
          this.importWalletWithKeystore(this.masterWalletId,"sssss",this.backupPassword,this.payPassword,this.phrasePassword);
         break;
       case 5:
          this.importWalletWithMnemonic(this.masterWalletId,this.mnemonic,this.phrasePassword,this.payPassword);
         break;
       case 6:
          this.exportWalletWithKeystore(this.backupPassword,this.payPassword);
         break;
       case 7:
          this.exportWalletWithMnemonic(this.backupPassword);
         break;
       case 8:
            this.getBalance();
         break;
       case 9:
             this.createAddress(this.chinaId);
         break;
       case 10:
            this.getAllAddress(this.chinaId);
         break;
       case 11:
            this.getBalanceWithAddress(this.chinaId);
         break;
      case 13:
           this.generateMultiSignTransaction();
         break;
      case 14:
          this.getAllTransaction();
        break;
        case 15:
        this.registerWalletListener(this.chinaId);
        break;
      case 16:
          this.checkSign("ssssss",this.singMessage,"sssss",this.payPassword);
        break;
      case 17:
           this.sign("1111111111111",this.payPassword);
       break;
      case 18:
         this.deriveIdAndKeyForPurpose(1,1,this.payPassword);
      break;
      case 19:
         this.getAllMasterWallets();
        break;
      case 20:
         this.destroyWallet(this.masterWalletId);
        break;
      case 21:
         this.isAddressValid(this.adress);
         break;
      case 22:
        this.getBalanceInfo(this.chinaId);
         break;
      case 24:
         this.generateMnemonic();
        break;
      case 25:
        this.saveConfigs();
        break;
      case 26:
        this.getWalletId();
        break;
      case 27:
         this.getAllChainIds();
         break;
      case 28:
         this.getSupportedChains();
         break;
      case 29:
         this.changePassword();
         break;
     }
   }

   changePassword(){
      this.walletManager.changePassword(this.masterWalletId,this.payPassword,this.newPassword,()=>{
               alert("修改成功");
      });
   }

   generateMnemonic(){
     this.walletManager.generateMnemonic(this.language,(result)=>{
          alert("=====generateMnemonic====="+JSON.stringify(result));
          //this.mnemonic = result.mnemonic.toString();
          //alert("住记词"+JSON.stringify(result));
     });
   }

   destroyWallet(masterWalletId:string){
       this.walletManager.destroyWallet(masterWalletId,(result)=>{
              alert("删除主钱包成功")
       });
   }

   createSubWallet(key){
      this.walletManager.createSubWallet(this.masterWalletId,key,0,(result)=>{
        alert("子钱包");
        alert(JSON.stringify(result));
      });
   }

   recoverSubWallet(){
    this.walletManager.recoverSubWallet(this.masterWalletId,this.chinaId,0,0,()=>{
      alert("恢复子钱包");
    });
   }


   createMasterWallet(masterWalletId,mnemonic,phrasePassword,payPassWord){
    this.walletManager.createMasterWallet(masterWalletId,mnemonic,phrasePassword,payPassWord,false,(result)=>{
                   alert("创建主钱包成功");
     });
   }

   importWalletWithKeystore(masterWalletId:string,keystoreContent:string,backupPassWord:string,payPassWord:string,phrasePassword:string){
         this.walletManager.importWalletWithKeystore(masterWalletId,keystoreContent,backupPassWord,payPassWord,()=>{
                      alert("导入keystore成功");
         })
   }

   importWalletWithMnemonic(masterWalletId:string,mnemonic:string ,phrasePassword:string ,payPassWord:string){
       this.walletManager.importWalletWithMnemonic(masterWalletId,mnemonic,phrasePassword,payPassWord,false,()=>{
        alert("导入住记词成功");
       });
   }

   exportWalletWithKeystore(backupPassword: string,payPassWord:string){
       this.walletManager.exportWalletWithKeystore(this.masterWalletId,backupPassword,payPassWord,(result)=>{
        alert("导出keystore成功"+JSON.stringify(result));
       });
   }

   exportWalletWithMnemonic(backupPassword:string ){
          this.walletManager.exportWalletWithMnemonic(this.masterWalletId,backupPassword,(result)=>{
                   alert(JSON.stringify(result));
          });
   }

   createAddress(chinaId:string){
         this.walletManager.createAddress(this.masterWalletId,chinaId,(result)=>{
                this.adress = result.address;
                alert(this.adress);
         });
   }

   getAllAddress(chinaId:string){
        alert("===chinaId===="+chinaId);
        this.walletManager.getAllAddress(this.masterWalletId,chinaId,0,(result)=>{
            alert(JSON.stringify(result));
        });
   }

   getBalanceWithAddress(chinaId:string){
        this.walletManager.getBalanceWithAddress(this.masterWalletId,chinaId,"eeeeeeee",2,(result)=>{
            alert(JSON.stringify(result));
        });
   }

   generateMultiSignTransaction(){

   }

   getAllTransaction(){
      this.walletManager.getAllTransaction(this.masterWalletId,this.chinaId,0,"123455",(result)=>{
      alert(JSON.stringify(result));
     });
   }

   registerWalletListener(chinaId:string){
     this.walletManager.registerWalletListener(this.masterWalletId,chinaId,(resust)=>{
             alert("监听注册成功");
     });
   }

   checkSign(address:string, message:string, signature:string, payPassword:string){
         this.walletManager.checkSign(this.masterWalletId,this.chinaId,address,message,signature,(result)=>{
          alert(JSON.stringify(result));
         });
   }

   sign(message:string,payPassword:string){
    this.walletManager.sign(this.masterWalletId,this.chinaId,message, payPassword,(result)=>{
         alert(JSON.stringify(result));
         this.singMessage = result;
    })
   }

   getBalance(){
     this.walletManager.getBalance(this.masterWalletId,this.chinaId,0,(result)=>{
      alert("获取余额"+JSON.stringify(result));
     })
   }

   deriveIdAndKeyForPurpose(purpose:number,index:number,payPassword:string){
            this.walletManager.deriveIdAndKeyForPurpose(purpose,index,payPassword,(result)=>{
                      alert(JSON.stringify(result));
            });
   }

   getAllMasterWallets(){
       this.walletManager.getAllMasterWallets((result)=>{
            alert("allAllMasterWallets"+JSON.stringify(result));
       });
   }

   isAddressValid(address:string){
     this.walletManager.isAddressValid(this.masterWalletId,address,(result)=>{
        alert("isAddressValid===="+JSON.stringify(result));
     });
   }

   getBalanceInfo(chinaId:string){
     this.walletManager.getBalanceInfo(this.masterWalletId,chinaId,(result)=>{
        alert("余额信息："+JSON.stringify(result));
     });
   }

   saveConfigs(){
     this.walletManager.saveConfigs((resust)=>{
         alert("保存配置成功");
     })
   }

   getWalletId(){

   }

   getAllChainIds(){
    this.walletManager.getAllChainIds((result)=>{
      alert("所有子钱包=="+JSON.stringify(result));
     });
   }

   getSupportedChains(){
    this.walletManager.getSupportedChains(this.masterWalletId,(result)=>{
      alert("已经支持的所有子钱包=="+JSON.stringify(result));
      for(let key in result){;
        this.createSubWallet(key);
     }
     });
   }

   createDID(){
     this.walletManager.createDID(this.payPassword,(result)=>{
             alert("==did=="+JSON.stringify(result));
             this.did = result.didname;
     });
   }

   getDIDList(){
    this.walletManager.getDIDList((result)=>{
             alert('==DIDList=='+JSON.stringify(result));
    });
   }

   destoryDID(did:string){
      this.walletManager.destoryDID(did,(result)=>{
             alert("删除成功："+did);
      });
   }

   didSetValue(){
         alert("===didSetValue==="+this.did);
         let obj = {
          "101": {
            "datahash": "datahash1",
            "proof": "hello proof1",
            "sign": "hello sign1"
          },
          "102": {
            "datahash": "datahash2",
            "proof": "hello proof2",
            "sign": "hello sign2"
          },
          "103": {
            "datahash": "datahash3",
            "proof": "hello proof3",
            "sign": "hello sign3"
          }
        };
        this.walletManager.didSetValue(this.did,"1",JSON.stringify(obj),(result)=>{
                   alert("====="+JSON.stringify(result));
        });
   }

   didGetValue(){
        this.walletManager.didGetValue(this.did,"1",(result)=>{
             alert("===didGetValue===="+JSON.stringify(result));
        });
   }

   didGetHistoryValue(){
     this.walletManager.didGetHistoryValue(this.did,"1",(result)=>{
           alert("===didGetHistoryValue===="+JSON.stringify(result));
     });
   }

   didGetAllKeys(){
      this.walletManager.didGetAllKeys(this.did,0,2,(result)=>{
        alert("===didGetAllKeys===="+JSON.stringify(result));
      });
   }

   didSign(){
     this.walletManager.didSign(this.did,"ssssss",this.payPassword,(result)=>{
             alert("===didSign==="+JSON.stringify(result));
             this.signature = "sssss";
     });
   }

   didCheckSign(){
      this.walletManager.didCheckSign(this.did,"ssssss",this.signature,(result)=>{
                  alert("===didCheckSign==="+JSON.stringify(result));
      });
   }

   didGetPublicKey(){
     this.walletManager.didGetPublicKey(this.did,(result)=>{
          alert("===didGetPublicKey==="+JSON.stringify(result));
     });
   }

   createTransaction(){
      this.walletManager.createTransaction(this.masterWalletId,this.chinaId,"",this.toAddress,1*this.unit,"sssssss", "ssss",false,(result)=>{
                      alert("=====createTransaction======"+JSON.stringify(result));
      });
   }

   calculateTransactionFee(){
     this.walletManager.calculateTransactionFee(this.masterWalletId,this.chinaId,this.rawTransaction,0,(result)=>{
                    alert("===== calculateTransactionFee ====="+JSON.stringify(result));
     })
   }

   sendRawTransaction(){
      // this.walletManager.sendRawTransaction(this.masterWalletId,this.chinaId,this.transactionJson,this.fee,this.payPassword,(result)=>{
      //                alert("===sendRawTransaction==="+JSON.stringify(result));
      // });
   }

}
