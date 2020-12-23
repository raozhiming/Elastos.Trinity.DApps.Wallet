import { Component, OnInit } from '@angular/core';
import { ThemeService } from 'src/app/services/theme.service';
import { Native } from 'src/app/services/native.service';
import { TranslateService } from '@ngx-translate/core';
import { Util } from 'src/app/model/Util';
import { Router } from '@angular/router';
import { ERC20Coin } from 'src/app/model/Coin';
import { AppService } from 'src/app/services/app.service';

declare let appManager: AppManagerPlugin.AppManager;

@Component({
  selector: 'app-coin-erc20-details',
  templateUrl: './coin-erc20-details.page.html',
  styleUrls: ['./coin-erc20-details.page.scss'],
})
export class CoinErc20DetailsPage implements OnInit {

  public coin: ERC20Coin;
  public contractAddress: string = '1234';
  public canDelete: boolean = false;

  public Util = Util;

  constructor(
    private appService: AppService,
    public theme: ThemeService,
    private native: Native,
    private translate: TranslateService,
    private router: Router,
  ) { }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (!Util.isEmptyObject(navigation.extras.state)) {
        this.coin = navigation.extras.state.coin;
        console.log('ERC20 Details', this.coin);

        this.contractAddress = this.coin.getContractAddress();
        this.appService.setTitleBarTitle(this.coin.getName());
    }
  }

  copy() {
    this.native.copyClipboard(this.contractAddress);
    this.native.toast(this.translate.instant("copied"));
  }

  delete() {

  }

  share() {
    console.log('Sending "share" intent for', this.coin);

    const addCoinUrl =
      "https://wallet.elastos.net/addcoin?contract=" +
      encodeURIComponent(this.contractAddress);

    appManager.sendIntent("share", {
      title: this.translate.instant("share-erc20-token"),
      url: addCoinUrl,
    });
  }
}
