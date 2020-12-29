import { Component, OnInit, NgZone } from '@angular/core';
import { Events } from '@ionic/angular';
import { Native } from '../../../../services/native.service';
import { LocalStorage } from '../../../../services/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WalletManager } from 'src/app/services/wallet.service';
import { WalletEditionService } from 'src/app/services/walletedition.service';
import { MasterWallet } from 'src/app/model/wallets/MasterWallet';
import { ThemeService } from 'src/app/services/theme.service';
import { AppService } from 'src/app/services/app.service';
import { TranslateService } from '@ngx-translate/core';
import { StandardCoinName, ERC20Coin } from 'src/app/model/Coin';
import { PopupProvider } from 'src/app/services/popup.service';
import { CoinService } from 'src/app/services/coin.service';
import { PrefsService } from 'src/app/services/prefs.service';
import { ERC20CoinService } from 'src/app/services/erc20coin.service';
import { Util } from 'src/app/model/Util';
import { IntentService } from 'src/app/services/intent.service';

declare let appManager: AppManagerPlugin.AppManager;

@Component({
    selector: 'app-coin-add-erc20',
    templateUrl: './coin-add-erc20.page.html',
    styleUrls: ['./coin-add-erc20.page.scss'],
})
export class CoinAddERC20Page implements OnInit {

    public walletname: string = "";
    public masterWallet: MasterWallet = null;
    public allCustomERC20Coins: ERC20Coin[] = [];

    // public coinAddress: string = "0xa4e4a46b228f3658e96bf782741c67db9e1ef91c"; // TEST - TTECH ERC20 on mainnet
    public coinAddress: string = "";
    public coinName: string = null;
    public coinSymbol: string = null;

    public coinInfoFetched: boolean = false;
    public fetchingCoinInfo: boolean = false;

    public Util = Util;

    private intentMode = false;

    constructor(
        public route: ActivatedRoute,
        public native: Native,
        public localStorage: LocalStorage,
        public events: Events,
        private walletManager: WalletManager,
        private walletEditionService: WalletEditionService,
        private appService: AppService,
        private coinService: CoinService,
        private erc20CoinService: ERC20CoinService,
        private translate: TranslateService,
        public theme: ThemeService,
        private popup: PopupProvider,
        private prefs: PrefsService,
        private zone: NgZone,
        private router: Router,
        private intentService: IntentService
    ) {
        this.masterWallet = this.walletManager.getMasterWallet(this.walletEditionService.modifiedMasterWalletId);
        this.walletname = this.walletManager.masterWallets[this.masterWallet.id].name;
        this.getAllCustomERC20Coins();

        const navigation = this.router.getCurrentNavigation();
        if (!Util.isEmptyObject(navigation.extras.state)) {
            this.intentMode = true;
            this.coinAddress = navigation.extras.state.contract;
            this.checkCoinAddress();
            console.log('Received intent - checking coin address', this.coinAddress);
        }
    }

    ngOnInit() {
    }

    ionViewWillEnter() {
        appManager.setVisible("show", () => {}, (err) => {});
        this.appService.setTitleBarTitle(this.translate.instant("coin-adderc20-title"));

        if (this.intentMode) {
            this.appService.setBackKeyVisibility(false);
        } else {
            this.appService.setBackKeyVisibility(true);
        }
    }

    getAllCustomERC20Coins() {
        this.allCustomERC20Coins = this.coinService.getAvailableERC20Coins();
        console.log('All available erc20tokens', this.allCustomERC20Coins);
    }

    /**
     * Opens the scanner to get the coin address
     */
    scanCoinAddress() {
        appManager.sendIntent('https://scanner.elastos.net/scanqrcode', {}, {}, (res: { result: { scannedContent: string }}) => {
            if (res && res.result && res.result.scannedContent) {
                this.coinAddress = res.result.scannedContent;
                console.log('Got scanned content:', this.coinAddress);
                this.checkCoinAddress();
            }
        }, (err) => {
            console.error(err);
        });
    }

    checkCoinAddress() {
        this.zone.run(() => {
            // Check if this looks like a valid address. If not, give feedback to user.
            if (!this.erc20CoinService.isAddress(this.coinAddress)) {
                this.popup.ionicAlert("not-a-valid-address", "coin-adderc20-not-a-erc20-contract", "Ok");
                this.coinAddress = '';
            } else {
              /*   if (this.coinAlreadyAdded(this.coinAddress)) {
                    this.native.toast_trans('coin-adderc20-alreadyadded');
                    this.coinAddress = '';
                } else {
                    this.tryFetchingCoinByAddress(this.coinAddress);
                } */

                this.tryFetchingCoinByAddress(this.coinAddress);
            }
        });
    }

    coinAlreadyAdded(address: string): boolean {
        const targetCoin = this.allCustomERC20Coins.find((coin) => coin.getContractAddress() === address);
        if (targetCoin) {
            console.log('Address already exists', address);
            return true;
        } else {
            return false;
        }
    }

    private async tryFetchingCoinByAddress(address: string) {
        if (address !== '' && this.erc20CoinService.isAddress(address)) {
            // Coin address entered/changed: fetch its info.
            this.fetchingCoinInfo = true;
            this.coinInfoFetched = false;

            // Make sure user has the ETH sidechain enabled
            if (!this.masterWallet.hasSubWallet(StandardCoinName.ETHSC)) {
                this.popup.ionicAlert("no-ethereum-token", "please-add-ethereum-first", "Ok");
                this.fetchingCoinInfo = false;
                return;
            }

            const ethAccountAddress = await this.getEthAccountAddress();

            try {
                const contractCode = await this.erc20CoinService.isContractAddress(address);
                if (!contractCode) {
                    console.log("Contract at "+address+" does not exist");
                    this.fetchingCoinInfo = false;
                    this.native.toast_trans('coin-adderc20-not-found');
                } else {
                    console.log("Found contract at address " + address);
                    const coinInfo = await this.erc20CoinService.getCoinInfo(address, ethAccountAddress);

                    this.coinName = coinInfo.coinName;
                    console.log("Coin name", this.coinName);

                    this.coinSymbol = coinInfo.coinSymbol;
                    console.log("Coin symbol", this.coinSymbol);

                    this.coinInfoFetched = true;
                    this.fetchingCoinInfo = false;
                }
            } catch (e) {
                this.fetchingCoinInfo = false;
                console.log("Contract call exception - invalid contract? Not ERC20?");
                this.popup.ionicAlert("error", "coin-adderc20-invalid-contract-or-network-error", "Ok");
            }
        }
    }

    onInputAddress(address: string) {
        this.coinInfoFetched = false;
    }

    private async getEthAccountAddress(): Promise<string> {
        return this.masterWallet.getSubWallet(StandardCoinName.ETHSC).createAddress();
    }

    async addCoin() {
        if (this.coinAlreadyAdded(this.coinAddress)) {
            this.native.toast_trans('coin-adderc20-alreadyadded');
        }  else {
            const activeNetwork = await this.prefs.getActiveNetworkType();
            const newCoin = new ERC20Coin(this.coinSymbol, this.coinSymbol, this.coinName, this.coinAddress, activeNetwork, true);
            await this.coinService.addCustomERC20Coin(newCoin, this.masterWallet);

             // Coin added - go back to the previous screen
            if (this.intentMode) {
                await this.intentService.sendIntentResponse(
                    this.walletEditionService.intentTransfer.action,
                    this.coinAddress + ' added to wallet ' + this.masterWallet.name,
                    this.walletEditionService.intentTransfer.intentId
                );
            } else {
                this.native.pop();
            }
        }
    }
}
