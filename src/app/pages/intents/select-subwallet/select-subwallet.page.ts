import { Component, OnInit } from '@angular/core';
import { WalletManager } from 'src/app/services/wallet.service';
import { CoinTransferService } from 'src/app/services/cointransfer.service';
import { UiService } from 'src/app/services/ui.service';
import { StandardCoinName, CoinType } from 'src/app/model/Coin';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from 'src/app/services/theme.service';
import { CurrencyService } from 'src/app/services/currency.service';
import { AppService } from 'src/app/services/app.service';
import { IntentService } from 'src/app/services/intent.service';
import { MasterWallet } from 'src/app/model/wallets/MasterWallet';
import { Native } from 'src/app/services/native.service';

declare let appManager: AppManagerPlugin.AppManager;

@Component({
  selector: 'app-select-subwallet',
  templateUrl: './select-subwallet.page.html',
  styleUrls: ['./select-subwallet.page.scss'],
})
export class SelectSubwalletPage implements OnInit {

  public CoinType = CoinType;
  public chainId: StandardCoinName;

  constructor(
    public appService: AppService,
    public walletManager: WalletManager,
    public coinTransferService: CoinTransferService,
    public uiService: UiService,
    public translate: TranslateService,
    public theme: ThemeService,
    public currencyService: CurrencyService,
    public intentService: IntentService,
    private native: Native
  ) { }

  ngOnInit() {
    this.chainId = this.coinTransferService.chainId;
    // this.chainId = StandardCoinName.ETHSC;
  }

  ionViewWillEnter() {
    this.appService.setTitleBarTitle(this.translate.instant('select-subwallet'));
    appManager.setVisible("show", () => {}, (err) => {});
    this.appService.setBackKeyVisibility(false);
  }

  walletSelected(masterWallet: MasterWallet) {
    this.coinTransferService.masterWalletId = masterWallet.id;
    this.coinTransferService.walletInfo = masterWallet.account;
    this.native.go("/waitforsync");
  }

  async cancelOperation() {
    const intentParams = this.coinTransferService.intentTransfer;
    await this.intentService.sendIntentResponse(
        intentParams.action,
        { txid: null, status: 'cancelled' },
        intentParams.intentId
    );
  }
}
