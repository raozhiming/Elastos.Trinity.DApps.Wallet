import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavController ,NavParams,Events} from 'ionic-angular';
import {LocalStorage} from "../../../providers/Localstorage";
@Component({
  selector: 'page-language',
  templateUrl: 'language.html',
})
export class LanguagePage {

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
         this.localStorage.set("wallte-language",item).then(()=>{
          this.translate.use(newLang);
          this.events.publish("language:update",item);
          this.navCtrl.pop();
         });
  }

}
