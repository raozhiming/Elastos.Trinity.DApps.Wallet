import { Component, OnInit, NgZone } from '@angular/core';
import { ThemeService } from 'src/app/services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { MasterWallet, Theme } from 'src/app/model/MasterWallet';
import { WalletManager } from 'src/app/services/wallet.service';
import { WalletEditionService } from 'src/app/services/walletedition.service';
import { Native } from 'src/app/services/native.service';

@Component({
  selector: 'app-wallet-color',
  templateUrl: './wallet-color.page.html',
  styleUrls: ['./wallet-color.page.scss'],
})
export class WalletColorPage implements OnInit {

  public masterWallet: MasterWallet = null;
  public walletTheme: Theme = {
    color: '#752fcf',
    background: '/assets/cards/maincards/card-purple.svg'
  };

  public themes: Theme[] = [
    {
      color: '#752fcf',
      background: '/assets/cards/maincards/card-purple.svg'
    },
    {
      color: '#fdab94',
      background: '/assets/cards/maincards/card-pink.svg'
    },
    {
      color: '#4035cf',
      background: '/assets/cards/maincards/card-blue.svg'
    },
    {
      color: '#f5728e',
      background: '/assets/cards/maincards/card-red.svg'
    },
    {
      color: '#e6b54a',
      background: '/assets/cards/maincards/card-yellow.svg'
    },
    {
      color: '#18cece',
      background: '/assets/cards/maincards/card-lightblue.svg'
    },
  ];

  constructor(
    public themeService: ThemeService,
    public translate: TranslateService,
    private walletManager: WalletManager,
    private walletEditionService: WalletEditionService,
    public native: Native,
    public ngZone: NgZone
  ) { }

  ngOnInit() {
    this.getTheme();
  }

  getTheme() {
    this.masterWallet = this.walletManager.getMasterWallet(this.walletEditionService.modifiedMasterWalletId);
    if (this.masterWallet.theme) {
      this.walletTheme = this.masterWallet.theme;
    }
    console.log('Setting theme for master wallet ', this.masterWallet);
    console.log('Current wallet theme ', this.walletTheme);
  }

  async confirm() {
    if (this.walletTheme) {
      this.masterWallet.theme = this.walletTheme;
    } else {
      this.masterWallet.theme = {
        color: '#752fcf',
        background: '/assets/cards/maincards/card-purple.svg'
      };
    }

    await this.walletManager.saveMasterWallet(this.masterWallet);
    this.native.pop();
  }

}
