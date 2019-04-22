import { Component} from '@angular/core';
import {Platform, IonicApp,App} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LauncherComponent } from "../pages/launcher/launcher.component";
import { MnemonicComponent } from "../pages/mnemonic/mnemonic.component";
//import {WriteComponent} from "../pages/mnemonic/write/write.component";
import { ImportComponent } from "../pages/wallet/import/import.component";
import { ExprotPrikeyComponent } from "../pages/wallet/exprot-prikey/exprot-prikey.component";
//import {ReceiveComponent} from "../pages/coin/receive/receive.component";
import { TransferComponent } from "../pages/coin/transfer/transfer.component";
import {CoinComponent} from "../pages/coin/coin.component";
import { CoinListComponent } from "../pages/coin/coin-list/coin-list.component";
import {RecordinfoComponent} from "../pages/coin/recordinfo/recordinfo.component";
//import {RecordComponent} from "../pages/coin/record/record.component";
import { TestJniComponent } from '../pages/testjni/testjni.component';
//import { AddressComponent } from '../pages/wallet/address/address.component'
import { TabsComponent } from '../pages/tabs/tabs.component';
import { WalltelistPage } from '../pages/walltelist/walltelist';
import { ImportprivatekeyPage } from '../pages/importprivatekey/importprivatekey';
import { LocalStorage } from "../providers/Localstorage";
import { PaymentConfirmComponent } from "../pages/coin/payment-confirm/payment-confirm.component";
import { DidLoginComponent } from "../pages/third-party/did-login/did-login.component";
import { ManagerComponent } from "../pages/wallet/manager/manager.component"
import { Config } from '../providers/Config';
import { Util } from '../providers/Util';
import { TranslateService } from '@ngx-translate/core';
import { Native } from '../providers/Native';
//import { WalletManager } from '../providers/WalletManager';
import { PaypasswordResetComponent } from "../pages/wallet/paypassword-reset/paypassword-reset.component";
import { MyComponent } from '../pages/tabs/my/my.component';
import { WalletCreateComponent } from '../pages/wallet/wallet-create/wallet-create.component';
import { ContactsComponent } from '../pages/contacts/contacts.component';
import { ContactCreateComponent } from '../pages/contacts/contact-create/contact-create.component';
import { ContactListComponent } from '../pages/contacts/contact-list/contact-list.component';
import { CoinlistpasswordPage } from '../pages/coinlistpassword/coinlistpassword';
import { TxdetailsPage } from '../pages/txdetails/txdetails';
import { WalltemodePage } from '../pages/walltemode/walltemode';
import { ScancodePage } from '../pages/scancode/scancode';
import { InitializepagePage } from "../pages/initializepage/initializepage";
import {PaymentboxPage} from '../pages/paymentbox/paymentbox';
import { CoinSelectComponent } from "../pages/coin/coin-select/coin-select.component";
import {IdHomeComponent} from "../pages/id/home/home";
import {IdLauncherComponent} from "../pages/id/launcher/launcher";
import {PathlistPage} from '../pages/id/pathlist/pathlist';
import {PhonepathinfoPage} from '../pages/id/phonepathinfo/phonepathinfo';
import {PhoneauthPage} from '../pages/id/phoneauth/phoneauth';
import {IdentityauthPage} from '../pages/id/identityauth/identityauth';
import {IdentitypathinfoPage} from '../pages/id/identitypathinfo/identitypathinfo';
import {BankcardauthPage} from '../pages/id/bankcardauth/bankcardauth';
import {BankcardpathinfoPage} from '../pages/id/bankcardpathinfo/bankcardpathinfo';
import {CompanypathinfoPage} from '../pages/id/companypathinfo/companypathinfo';
import {IdKycCompanyComponent} from '../pages/id/kyc/company/company';
import {CompanyWriteChainPage} from '../pages/id/kyc/company-write-chain/company-write-chain';
import {PersonWriteChainPage} from '../pages/id/kyc/person-write-chain/person-write-chain';
import {ExportmnemomicPage} from '../pages/exportmnemomic/exportmnemomic';
import {ScanPage} from '../pages/scan/scan';
//add for plugin
declare var cordova: any;

@Component({
  selector: 'app',
  templateUrl: 'app.html',
})


export class AppComponent {
  rootPage: any;
  backButtonPressed: boolean = false;  //用于判断返回键是否触发
  constructor(public onicApp:IonicApp,public appCtrl: App, private platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public localStorage: LocalStorage, private translate: TranslateService, private native: Native) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      this.initTranslateConfig();
      this.init();
      //this.rootPage = ScanPage;
      //this.rootPage = PaymentboxPage;
      //this.initializeApp();
      //this.rootPage =  WalltelistPage;
      //this.rootPage = ImportprivatekeyPage;
      //  this.rootPage =  TabsComponent;
       //this.rootPage =  LauncherComponent;
      //this.rootPage =  ManagerComponent;
      //this.rootPage = ExprotPrikeyComponent;
      //this.rootPage = MyComponent;
      //  this.rootPage = WalletCreateComponent;
      //this.rootPage = TestJniComponent;
      //this.rootPage = MnemonicComponent;
      //this.rootPage = ImportComponent;
      //this.rootPage = ContactCreateComponent;
      //this.rootPage = ContactListComponent;
      //this.rootPage = CoinListComponent;
      //this.rootPage = TxdetailsPage;
      //this.rootPage = WalltemodePage;
      //this.rootPage = ScancodePage;
      //this.rootPage = InitializepagePage;
      //this.rootPage = RecordinfoComponent;
      //this.rootPage = CoinComponent;
      //this.rootPage = CoinSelectComponent;
      //this.rootPage = TransferComponent;
      //this.rootPage = IdLauncherComponent;
      //this.rootPage = PathlistPage;
      //this.rootPage = PhoneauthPage;
      //this.rootPage = PhonepathinfoPage;
      //this.rootPage = IdentityauthPage;
      //this.rootPage = IdentitypathinfoPage;
      //this.rootPage = BankcardauthPage;
      //this.rootPage = BankcardpathinfoPage;
      //this.rootPage = CompanypathinfoPage;
      //this.rootPage = IdKycCompanyComponent;
      //this.rootPage = CompanyWriteChainPage;
      //this.rootPage = PersonWriteChainPage;
      //  this.rootPage = ExportmnemomicPage;
      //init java 2 js plugin
    });


  }


  init(){
    //this.initJsPush();
    this.getKycIdList();

    this.localStorage.getProgress().then((pdata)=>{
      if(pdata){
        Config.perObj = JSON.parse(pdata);
      }

      this.localStorage.getMappingTable().then((data)=>{
        this.native.info(data);
        if(data){
          Config.setMappingList(JSON.parse(data));
         }
         this.rootPage = InitializepagePage;
      });
    });
  }

  //
  onReceiveJG(param) {
    let serialNum = JSON.parse(param)["serialNum"];
    let message1 = this.translate.instant("text-Jpush-kyc-message-1");
    let message2 = this.translate.instant("text-Jpush-kyc-message-2");
    alert(message1 + serialNum + message2);
    //  let serialNum = JSON.parse(param)["serialNum"];
    //  let serids = Config.getSerIds();
    //  let serid = serids[serialNum];
    //  let did = serid["id"];
    //  let appName = serid["appName"];
    //  let appr = serid["appr"];
    //  let idsObj = {};
    //  this.ls.getKycList("kycId").then((val)=>{
    //      if(val == null || val === undefined || val === {} || val === ''){
    //           return;
    //      }
    //   idsObj = JSON.parse(val);
    //   idsObj[did][appName][appr]["order"][serialNum]["status"] = 1;
    //   this.ls.set("kycId",idsObj).then(()=>{

    //   });
    //  });
  }

  initTranslateConfig() {
    this.translate.addLangs(["zh", "en"]);
    this.localStorage.getLanguage("wallte-language").then((val) => {
      if (val == null) {
        let lang = navigator.language.substr(0,2);
        let languageObj = {
          name: 'English',
          isoCode: 'en'
        };
        if(lang == 'en'){
          languageObj = {
            name: 'English',
            isoCode: 'en'
          };
        }else if(lang == 'zh'){
          languageObj = {
            name: '中文（简体）',
            isoCode: 'zh'
          };
        }
        this.localStorage.set("wallte-language", languageObj).then(() => {
          // 设置默认语言
          this.translate.setDefaultLang(lang);
          this.translate.use(lang);
          if(lang == 'en'){
             this.native.setMnemonicLang("english")
          }else if(lang == "zh"){
            this.native.setMnemonicLang("chinese");
          }else{
            this.native.setMnemonicLang("english");
          }
        });
      } else {
        let lang = JSON.parse(val)["isoCode"];
        this.translate.use(lang);
        if(lang == 'en'){
          this.native.setMnemonicLang("english")
        }else if(lang == "zh"){
         this.native.setMnemonicLang("chinese");
        }else{
         this.native.setMnemonicLang("english");
        }
      }
    })

  }

  getKycIdList(){
    this.localStorage.getKycList("kycId").then((val) => {

      if (val == null || val === undefined || val === {} || val === '') {
        return;
      }
      let serids = Config.getSertoId(JSON.parse(val));
      Config.setSerIds(serids);
    });
  }

}


