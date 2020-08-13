import { Component, OnInit } from '@angular/core';
import { CurrencyService } from 'src/app/services/currency.service';
import { ThemeService } from 'src/app/services/theme.service';
import { LocalStorage } from 'src/app/services/storage.service';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-currency-select',
  templateUrl: './currency-select.page.html',
  styleUrls: ['./currency-select.page.scss'],
})
export class CurrencySelectPage implements OnInit {

  constructor(
    public currencyService: CurrencyService,
    public theme: ThemeService,
    public translate: TranslateService,
    private appService: AppService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.appService.setTitleBarTitle(this.translate.instant('select-currency-title'));
  }

}
