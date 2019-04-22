import {Component} from '@angular/core';
import {Util} from "../../../providers/Util";
import {IdLauncherComponent} from "../../id/launcher/launcher";
import {LocalStorage} from "../../../providers/Localstorage";
import {Config} from "../../../providers/Config";
import {WalletManager} from '../../../providers/WalletManager';
import { NavController, NavParams} from 'ionic-angular';
import {Native} from "../../../providers/Native";
import {PopupProvider} from "../../../providers/popup";
import {Platform} from 'ionic-angular';

@Component({
  selector: 'app-did-login',
  templateUrl: './did-login.component.html'
})
export class DidLoginComponent{

  kycIdArr: any=[];
  didNum: '';
  sign: '';
  didPubkey: '';
  message: string;

  constructor(public navCtrl: NavController,public navParams: NavParams,public native :Native, public localStorage:LocalStorage, public walletManager: WalletManager, public popupProvider: PopupProvider, public platform  : Platform,){
    this.init();
  }

  init(){
    // this.setHeadDisPlay({left: false});
    this.message = Util.GetQueryString("message");
    this.localStorage.get('kycId').then((val)=>{
      // val = '{"icgQf7G19ZMq97RUbsz3S6Y5sYiCT3qcEb":{"id":"icgQf7G19ZMq97RUbsz3S6Y5sYiCT3qcEb","kyc":{"person":{"order":{"VTT1530900147221199":{"txHash":"375cfb778c9fb114dc098eb15d37d7488bb5ed578813db0c517850af672a1e91","serialNum":"VTT1530900147221199"}}},"company":{"order":{"RLU1530971869338288":{"txHash":"510e0d8cb4195f6d5050a0ca87948bd91eee05f95d7e9143278d8e7909bd7f81","serialNum":"RLU1530971869338288","status":1,"params":{"id":"icgQf7G19ZMq97RUbsz3S6Y5sYiCT3qcEb","appName":"kyc","type":"company","adata":[{"type":"enterprise","result":"success","retdata":{"app":"b1c0b7028c8c4be3beafc4c4812ae92e","signature":"a46616afee601bfd26651dba4afe33c54e865f6a8b504bb3dd042edde934669affcfa77e4b3798d9539c4131c1af545bba6e65987a71e6abefe195ca0435e8af","RegistrationNum":"911101080804655794","legalPerson":"詹克团","word":"北京比特大陆科技有限公司","authid":"12345678","ts":"1532506548"},"message":"认证成功","timestamp":"1532506561601","resultSign":"3045022079b6cab8d7d91ae76813f7da0e725c903288ed5b51cb931591eb23ea2827cc9e022100eb393cadf921c73c0a4fa00317683058250d256f77e771675ffb6120f5ea4cbe"}]}},"TIN1531045028308086":{"txHash":"66cb274d4b50e56293e0de42d982ce808909ba471edb601635193dcbaf840efc","serialNum":"TIN1531045028308086"}}}}},"icLDfCPLE4ukMT98uc6RLBRMbU7kEVS7Jw":{"id":"icLDfCPLE4ukMT98uc6RLBRMbU7kEVS7Jw","kyc":{"person":{"order":{"VMN1530988285253940":{"txHash":"c71a83a5aa50513bffe507d819d0d7657d78c752a73ae7ce41b081d687f2ea83","serialNum":"VMN1530988285253940"},"WIY1531042401043980":{"txHash":"88a3dc5afa44b933118a05b87e9ddd9a9e47c8259dd644bbfd7c28cf4401b5c6","serialNum":"WIY1531042401043980","status":1,"params":{"id":"icLDfCPLE4ukMT98uc6RLBRMbU7kEVS7Jw","appName":"kyc","type":"person","adata":[{"type":"identityCard","result":"fail","retdata":{"app":"b1c0b7028c8c4be3beafc4c4812ae92e","identityNumber":"410426198811151012","signature":"ad9df962257ff74095e2ef57d193d76863a287af9ca63735a94eaad860b310e4e3863bb6779711d7d44d3031d9b77cf6f6ff09a36d337ac437ab50ce80a8c5fd","fullName":"sss","authid":"12345678","ts":"1532575197"},"message":"认证失败","timestamp":"1532575217651","resultSign":"30440220686636a8c7b524f8ebdd97c2a8689f2389554da5e380f1490410c2d80ee141dc022024493c6ac9fb103401cb0ef7f40b6e82a4c4f5f85ea7d7c254b51b409235ecf3"}]}}}}}},"iewY47FYSPkEBCRFSzKFfXG1KksiZThy16":{"id":"iewY47FYSPkEBCRFSzKFfXG1KksiZThy16","kyc":{"person":{"order":{"HVL1531050647361408":{"txHash":"534502cc52e8b49d6f81d6a1cd69f3cceea4708fee34a974335f8b826f080493","serialNum":"HVL1531050647361408","status":1,"params":{"id":"iewY47FYSPkEBCRFSzKFfXG1KksiZThy16","appName":"kyc","type":"person","adata":[{"type":"identityCard","result":"success","retdata":{"app":"b1c0b7028c8c4be3beafc4c4812ae92e","identityNumber":"410426198811151012","signature":"2a19abed07b36348f8d60d4f56dc98d249df1e7e2ee63579f908d69d5fca1dc7ca18781ab842673de20a56ab22786c3450614acca942604f24ec6ea0b5b76b3f","fullName":"宋家准","authid":"12345678","ts":"1532583359"},"message":"认证成功","timestamp":"1532583582624","resultSign":"3044022060f94a0468476128137419cdbce4119447c5a1ab2c3726ea425b52b53260307102204da37c14ba89d2cdcb048c4e6012d0c68fa6c44efb95b11c26d53d368ad6234c"}]}},"EEZ1531051833346236":{"txHash":"fc9ada7d5d009262409bff5e77a899fdc30288de7250e54f56cf90a4d41b6947","serialNum":"EEZ1531051833346236","status":1,"params":{"id":"iewY47FYSPkEBCRFSzKFfXG1KksiZThy16","appName":"kyc","type":"person","adata":[{"type":"identityCard","result":"success","retdata":{"app":"b1c0b7028c8c4be3beafc4c4812ae92e","identityNumber":"410426198811151012","signature":"da12d5d3b15c42ab7cada88810ec578d6745b91e28cf33dfb2a215a60f69fa79ec3116faf47d36e43fd94100b1a80d2e85ea4af52bd483048b327e40b7c5c699","fullName":"宋家准","authid":"12345678","ts":"1532584799"},"message":"认证成功","timestamp":"1532584858522","resultSign":"3045022100b800312fb4d824c4699cf4ff20837e29722e22f50535da6815336de2a9b6605b02204aef5f2476bf12482d4b73568614e3426eb261a8a27b5f171fed928759bae847"},{"type":"phone","result":"success","retdata":{"app":"b1c0b7028c8c4be3beafc4c4812ae92e","identityNumber":"410426198811151012","signature":"428dd9fab4c63a1301609177fc165abc18f3f798ab93b388d7c5c9e89911d249d93bf37122383c47fdd8bdc477a6257d7d7962260dc73471613b2bf6ba8cb694","mobile":"18210230496","fullName":"宋家准","authid":"12345678","ts":"1532584799"},"message":"认证成功","timestamp":"1532584858522","resultSign":"3045022100e5ac2c6bbb5c5042c51cc18696d1f37e20f5f5591f7085fdc3efabad0bc8016b02206f8de35b0a783917e8489a8038cb820c6f08d3d7cd095f26611afb9d0238d79c"}]}},"TNL1531052347373694":{"txHash":"196a23ec728a8b984fc8adf8f108ec1bf534cdbd032cebc48d8bc3c77a2a3b27","serialNum":"TNL1531052347373694","status":1,"params":{"id":"iewY47FYSPkEBCRFSzKFfXG1KksiZThy16","appName":"kyc","type":"person","adata":[{"type":"identityCard","result":"success","retdata":{"app":"b1c0b7028c8c4be3beafc4c4812ae92e","identityNumber":"410426198811151012","signature":"3adb5ef3593541dfcc3af21063227833d48ae50224ff479004748325715d2b942532364e463c3a81a04d05db6a2f8dc40cd521d75eae162a36fec5c2b5a64803","fullName":"宋家准","authid":"12345678","ts":"1532585280"},"message":"认证成功","timestamp":"1532585373718","resultSign":"30460221008d677c0917270b7ed8996a472d905c499e62f79c841468a0c90e34ff9c0fb40e022100a8a6c43eaa48425b27a8c5789a50951db4dc21f744a14607ceb7c7e6b9cd5207"},{"type":"bankCard","result":"fail","retdata":null,"message":"无信息","timestamp":"1532585373718","resultSign":"3046022100b557796782b3392adfc51b9acacc93857cf8dd3ee206bc35613a445809cfd009022100c1f29f71dfbd60a7a36c1d55228f45f4a4bc1bb24fd4889c79aa83548ae9cefe"}]}},"WSE1531054511779122":{"txHash":"11de788a37cd2b8777fca7ed313232681257fe2f380d93c392d6d02f47171e8c","serialNum":"WSE1531054511779122","status":1,"params":{"id":"iewY47FYSPkEBCRFSzKFfXG1KksiZThy16","appName":"kyc","type":"person","adata":[{"type":"identityCard","result":"success","retdata":{"app":"b1c0b7028c8c4be3beafc4c4812ae92e","identityNumber":"410426198811151012","signature":"9f84e0c9546ef01ea0c6c077d60a7d3a9486847a9fad71562890081fd467a02a257950ee563a1298f7f0e6907c88b64c9a50c7d939fb36971751e59fd33e019f","fullName":"宋家准","authid":"12345678","ts":"1532587201"},"message":"认证成功","timestamp":"1532587852623","resultSign":"3045022100aa8addd6408c7389f25e91c21af06e29b23760ac8869980345a51065e00a8fee02205de4240b25ea0837c08b9b9988ef3488fd22937571857959fa887fa0ef9dfa0e"},{"type":"bankCard","result":"fail","retdata":null,"message":"无信息","timestamp":"1532587852623","resultSign":"30440220590221ac2379a412c0086e77e11b3eba0a9a90b0130b21d37d691b55d1c6a98b022017a08d4f68a74894ed6e15e6039350023cba88f5754a47982fd782f1e89b8dec"}]}},"GEB1531056345447618":{"txHash":"aee4106d49b1d1507c7130bb9bb2d9b30a27bbde9ec98414bf2e9e1eed1fd8b7","serialNum":"GEB1531056345447618"}}},"company":{}}},"ioEF4VCSu2whqm9hD44jhkjCMAqd4U8Q3k":{"id":"ioEF4VCSu2whqm9hD44jhkjCMAqd4U8Q3k"}}'
      if(val === null){
        this.kycIdArr = [];
        this.native.Go(this.navCtrl, IdLauncherComponent);
      }else{
        this.kycIdArr = Config.objtoarr(JSON.parse(val));
      }
    });
  }

  onItem(itemId){
    this.popupProvider.presentPrompt().then((val)=>{
      if(Util.isNull(val)){
        this.native.toast_trans("text-id-kyc-prompt-password");
        return;
      }
      this.didNum = itemId;
      this.walletManager.didSign(itemId, this.message, val.toString(), (data)=>{
        this.sign = data.value;
      })
      this.walletManager.didGetPublicKey(itemId, (data)=>{
        this.didPubkey = data.value;
      })
      let result = {
        didNum: this.didNum,
        sign: this.sign,
        didPubkey: this.didPubkey
      }
      // return result;
      this.platform.exitApp();
    });
  }

}
