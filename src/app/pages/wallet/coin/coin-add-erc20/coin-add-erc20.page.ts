import { Component, OnInit, NgZone } from '@angular/core';
import { Events } from '@ionic/angular';
import { Util } from '../../../../model/Util';
import { Native } from '../../../../services/native.service';
import { LocalStorage } from '../../../../services/storage.service';
import { ActivatedRoute } from '@angular/router';
import { WalletManager } from 'src/app/services/wallet.service';
import { WalletEditionService } from 'src/app/services/walletedition.service';
import { MasterWallet } from 'src/app/model/wallets/MasterWallet';
import { ThemeService } from 'src/app/services/theme.service';
import { AppService } from 'src/app/services/app.service';
import { TranslateService } from '@ngx-translate/core';
import Web3 from 'web3';
import * as TrinitySDK from '@elastosfoundation/trinity-dapp-sdk';
import { StandardCoinName, ERC20Coin, Coin, CoinType } from 'src/app/model/Coin';
import { PopupProvider } from 'src/app/services/popup.service';
import { CoinService } from 'src/app/services/coin.service';
import { PrefsService } from 'src/app/services/prefs.service';

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

    /** Web3 variables to call smart contracts */
    private web3: Web3;
    private erc20ABI: any;

    constructor(
        public route: ActivatedRoute,
        public native: Native,
        public localStorage: LocalStorage,
        public events: Events,
        private walletManager: WalletManager,
        private walletEditionService: WalletEditionService,
        private appService: AppService,
        private coinService: CoinService,
        private translate: TranslateService,
        public theme: ThemeService,
        private popup: PopupProvider,
        private prefs: PrefsService,
        private zone: NgZone
    ) {
        this.masterWallet = this.walletManager.getMasterWallet(this.walletEditionService.modifiedMasterWalletId);
        this.walletname = this.walletManager.masterWallets[this.masterWallet.id].name;
        this.getAllCustomERC20Coins();

        console.log('All available erc20tokens', this.allCustomERC20Coins);

        let trinityWeb3Provider = new TrinitySDK.Ethereum.Web3.Providers.TrinityWeb3Provider();
        this.web3 = new Web3(trinityWeb3Provider);

        // Standard ERC20 contract ABI
        this.erc20ABI = require("../../../../../assets/ethereum/StandardErc20ABI.json");
    }

    ngOnInit() {
    }

    ionViewWillEnter() {
        this.appService.setBackKeyVisibility(true);
        this.appService.setTitleBarTitle(this.translate.instant("coin-adderc20-title"));
    }

    async getAllCustomERC20Coins() {
        const availableCoins: Coin[] = await this.coinService.getAvailableCoins();
        this.allCustomERC20Coins = availableCoins.filter(c => {
            return c.getType() === CoinType.ERC20;
        }) as ERC20Coin[];
        console.log('all erc20 coins', this.allCustomERC20Coins);
    }

    /**
     * Opens the scanner to get the coin address
     */
    scanCoinAddress() {
        appManager.sendIntent('scanqrcode', {}, {}, (res: { result : { scannedContent: string }}) => {
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
            if (!this.web3.utils.isAddress(this.coinAddress)) {
                this.popup.ionicAlert("not-a-valid-address", "coin-adderc20-not-a-erc20-contract", "Ok");
                this.coinAddress = '';
            } else {
                if (this.coinAlreadyAdded(this.coinAddress)) {
                    this.native.toast_trans('coin-adderc20-alreadyadded');
                    this.coinAddress = '';
                } else {
                    this.tryFetchingCoinByAddress(this.coinAddress);
                }
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
        if (address !== "" && this.web3.utils.isAddress(address)) {
            // Coin address entered/changed: fetch its info.
            this.fetchingCoinInfo = true;
            this.coinInfoFetched = false;

            // Make sure user has the ETH sidechain enabled
            if (!this.masterWallet.hasSubWallet(StandardCoinName.ETHSC)) {
                this.popup.ionicAlert("no-ethereum-token", "please-add-ethereum-first", "Ok");
                this.fetchingCoinInfo = false;
                return;
            }

            let ethAccountAddress = await this.getEthAccountAddress();
            let erc20Contract = new this.web3.eth.Contract(this.erc20ABI, address, { from: ethAccountAddress });
            console.log("erc20Contract", erc20Contract);

            try {
                let contractCode = await this.web3.eth.getCode(address);
                if (contractCode === "0x") {
                    console.log("Contract at "+address+" does not exist");
                    this.fetchingCoinInfo = false;
                    this.native.toast_trans('coin-adderc20-not-found');
                } else {
                    console.log("Found contract at address " + address);

                    this.coinName = await erc20Contract.methods.name().call();
                    console.log("Coin name", this.coinName);

                    this.coinSymbol = await erc20Contract.methods.symbol().call();
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

    async onInputAddress(address: string) {
        if (!address) {
            this.coinInfoFetched = false;
        }
    }

    private async getEthAccountAddress(): Promise<string> {
        return this.masterWallet.getSubWallet(StandardCoinName.ETHSC).createAddress();
    }

    async addCoin() {
        let activeNetwork = await this.prefs.getActiveNetworkType();
        let newCoin = new ERC20Coin(this.coinSymbol, this.coinSymbol, this.coinName, this.coinAddress, activeNetwork);
        await this.coinService.addCustomERC20Coin(newCoin, this.masterWallet);

        // Coin added - go back to the previous screen
        this.native.pop();
    }
}
