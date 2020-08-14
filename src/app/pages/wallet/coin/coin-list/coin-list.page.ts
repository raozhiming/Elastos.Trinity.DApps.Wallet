import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, Events } from '@ionic/angular';
import { Config } from '../../../../config/Config';
import { LocalStorage } from '../../../../services/storage.service';
import { Native } from '../../../../services/native.service';
import { PopupProvider} from '../../../../services/popup.service';
import { WalletManager } from '../../../../services/wallet.service';
import { MasterWallet } from 'src/app/model/MasterWallet';
import { Coin } from 'src/app/model/Coin';
import { CoinService } from 'src/app/services/coin.service';
import { WalletEditionService } from 'src/app/services/walletedition.service';
import { AppService } from 'src/app/services/app.service';
import { ThemeService } from 'src/app/services/theme.service';
import { Util } from 'src/app/model/Util';
import { TranslateService } from '@ngx-translate/core';
import { UiService } from 'src/app/services/ui.service';

type EditableCoinInfo = {
    coin: Coin,
    isOpen: boolean
}

@Component({
    selector: 'app-coin-list',
    templateUrl: './coin-list.page.html',
    styleUrls: ['./coin-list.page.scss'],
})

export class CoinListPage implements OnInit, OnDestroy {

    masterWallet: MasterWallet = null;
    coinList: EditableCoinInfo[] = null;
    coinListCache = {};
    payPassword: string = "";
    singleAddress: boolean = false;
    currentCoin: any;

    // Helpers
    public Util = Util;
    public SELA = Config.SELA;

    constructor(
        public walletManager: WalletManager,
        public popupProvider: PopupProvider,
        private coinService: CoinService,
        private walletEditionService: WalletEditionService,
        private appService: AppService,
        public native: Native,
        public localStorage: LocalStorage,
        public modalCtrl: ModalController,
        public events: Events,
        private uiService: UiService,
        private translate: TranslateService,
        public theme: ThemeService
    ) {
        this.init();
    }

    ngOnInit() {
    }

    ionViewWillEnter() {
        this.appService.setBackKeyVisibility(true);
        this.appService.setTitleBarTitle(this.translate.instant("coin-list-title"));
    }

    async switchCoin(item: EditableCoinInfo, open: boolean) {
        item.isOpen = open;
        this.native.info(item);

        this.currentCoin = item;
        await this.native.showLoading();

        if (item.isOpen) {
            await this.createSubWallet(item.coin);
        } else {
            await this.destroySubWallet(item.coin);
        }
    }

    async init() {
        this.events.subscribe("error:update", () => {
            this.currentCoin["open"] = false;
        });
        this.events.subscribe("error:destroySubWallet", () => {
            this.currentCoin["open"] = true;
        });

        this.masterWallet = this.walletManager.getMasterWallet(this.walletEditionService.modifiedMasterWalletId);

        this.native.hideLoading();

        this.coinList = [];
        for (let availableCoin of this.coinService.getAvailableCoins()) {
            let isOpen = (availableCoin.getID() in this.masterWallet.subWallets);
            console.log(availableCoin, "isOpen?", isOpen);
            this.coinList.push({ coin: availableCoin, isOpen: isOpen });
        }
        console.log('coin list', this.coinList);
    }

    async createSubWallet(coin: Coin) {
        try {
            this.native.hideLoading();

            // Create the sub Wallet (ex: IDChain)
            await this.masterWallet.createSubWallet(coin);
        } catch (error) {
            this.currentCoin["open"] = false; // TODO: currentCoin type
        }
    }

    async destroySubWallet(coin: Coin) {
        this.native.hideLoading();

        await this.masterWallet.destroySubWallet(coin.getID());
    }

    ngOnDestroy() {
        this.events.unsubscribe("error:update");
        this.events.unsubscribe("error:destroySubWallet");
    }

    onSelect(item: EditableCoinInfo) {
        if (item.isOpen) {
            this.popupProvider.ionicConfirm('confirmTitle', 'text-coin-close-warning').then((data) => {
                if (data) {
                    this.switchCoin(item, false);
                } else {
                    // TODO cancel, set checked
                }
            });
        } else {// open
            this.switchCoin(item, true);
        }
    }

    getCoinTitle(item: EditableCoinInfo) {
        return this.masterWallet.coinService.getCoinByID(item.coin.getID()).getDescription();
    }

    getCoinSubtitle(item: EditableCoinInfo) {
        return this.masterWallet.coinService.getCoinByID(item.coin.getID()).getName();
    }

    getCoinIcon(item: EditableCoinInfo) {
        switch (item.coin.getID()) {
            case 'ELA':
                return "assets/coins/ela-black.svg";
            case 'IDChain':
                return "assets/coins/ela-turquoise.svg";
            case 'ETHSC':
                return "assets/coins/ela-gray.svg";
            default:
                return "assets/coins/eth.svg";
        }
    }
}
