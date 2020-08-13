import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorage } from './storage.service';

type Currency = {
  symbol: string;
  name: string;
  price: number;
  icon: string;
};

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  public elaStats: any;
  private proxyurl = "https://cors-anywhere.herokuapp.com/";

  public selectedCurrency: Currency;
  public currencies: Currency[] = [
    {
      symbol: 'USD',
      name: 'United States Dollar',
      price: 0,
      icon: '/assets/currencies/usd.png'
    },
    {
      symbol: 'CNY',
      name: 'Chinese Yuan',
      price: 0,
      icon: '/assets/currencies/cny.png'
    },
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 0,
      icon: '/assets/currencies/btc.png'
    }
  ];

  constructor(
    private http: HttpClient,
    private storage: LocalStorage
  ) { }

  async init() {
    await this.getSavedCurrency();
    this.fetch();
  }

  getSavedCurrency() {
    return new Promise((resolve, reject) => {
      this.storage.getCurrency().then((symbol) => {
        if (symbol) {
          this.selectedCurrency = this.currencies.find((currency) => currency.symbol === symbol);
          console.log('Currency saved', this.selectedCurrency);
        } else {
          this.selectedCurrency = this.currencies.find((currency) => currency.symbol === 'USD');
          console.log('No currency saved, using default USD', this.selectedCurrency);
        }
        resolve();
      });
    });
  }

  fetch() {
    this.http.get<any>(this.proxyurl + 'https://api-price.elaphant.app/api/1/cmc?limit=200').subscribe((res) => {
      console.log('Got CMC response', res);
      this.elaStats = res.find((coin) => coin.symbol === 'ELA');
      if (this.elaStats) {
        console.log('CMC ELA stats', this.elaStats);
        this.addPriceToCurrency();
      }
    }, (err) => {
      console.error('Fetch CMC Stats err', err);
    });
  }

  async addPriceToCurrency() {
    this.currencies.map((currency) => {
      if (currency.symbol === 'USD') {
        currency.price = parseFloat(this.elaStats.price_usd);
      }
      if (currency.symbol === 'CNY') {
        currency.price = parseFloat(this.elaStats.price_cny);
      }
      if (currency.symbol === 'BTC') {
        currency.price = parseFloat(this.elaStats.price_btc);
      }
    });
    console.log('Currency ELA prices updated', this.currencies);
  }

  getCurrencyBalance(cryptoBalance: number): string {
    const currencyBalance = this.selectedCurrency.price * cryptoBalance;
    if (!cryptoBalance) {
      return String(0);
    } else if (this.selectedCurrency.symbol === 'BTC' && cryptoBalance !== 0) {
      return currencyBalance.toFixed(8);
    } else {
      return currencyBalance.toFixed(2);
    }
  }

  saveCurrency(currency: Currency) {
    this.selectedCurrency = currency;
    this.storage.setCurrency(currency.symbol);
  }
}
