import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavController ,NavParams,Events} from '@ionic/angular';
import { LocalStorage } from '../../../services/Localstorage';

@Component({
  selector: 'app-wallet-language',
  templateUrl: './wallet-language.page.html',
  styleUrls: ['./wallet-language.page.scss'],
})
export class WalletLanguagePage implements OnInit {
  public currentLanguage: any;
  public languages: any;
  constructor(
    private navCtrl: NavController,
    private translate: TranslateService,
    public navParams: NavParams,
    public localStorage: LocalStorage,
    public events: Events
  ) {
      this.languages =[{
        name: 'English',
        isoCode: 'en'
      }, {
        name: '中文（简体）',
        isoCode: 'zh',
        useIdeograms: true,
      }]

      this.currentLanguage = this.navParams.data["isoCode"] || 'en';
      this.translate.use(this.currentLanguage);
  }

  ngOnInit() {
  }

  public save(newLang: string): void {
         let item = {};
         if(newLang === 'zh'){
               item = {
                name: '中文（简体）',
                isoCode: 'zh',
              };
         }else{
          item = {
            name: 'English',
            isoCode: 'en'
          };
         }
         this.localStorage.set("wallet-language",item).then(()=>{
          this.translate.use(newLang);
          this.events.publish("language:update",item);
          this.navCtrl.pop();
         });
  }

}
