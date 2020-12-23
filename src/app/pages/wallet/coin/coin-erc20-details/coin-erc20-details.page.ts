import { Component, OnInit } from '@angular/core';
import { ThemeService } from 'src/app/services/theme.service';
import { Native } from 'src/app/services/native.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-coin-erc20-details',
  templateUrl: './coin-erc20-details.page.html',
  styleUrls: ['./coin-erc20-details.page.scss'],
})
export class CoinErc20DetailsPage implements OnInit {

  public qrcode: string = '1234';
  public canDelete: boolean = false;

  constructor(
    public theme: ThemeService,
    private native: Native,
    private translate: TranslateService
  ) { }

  ngOnInit() {
  }

  copy() {
    this.native.copyClipboard(this.qrcode);
    this.native.toast(this.translate.instant("contract-address-copied"));
  }

  delete() {

  }

  share() {

  }

}
