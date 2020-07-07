import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, Events } from '@ionic/angular';
import { Config } from '../../../../config/Config';
import { LocalStorage } from '../../../../services/storage.service';
import { Native } from '../../../../services/native.service';
import { PopupProvider} from '../../../../services/popup.service';
import { WalletManager } from '../../../../services/wallet.service';
import { MasterWallet } from 'src/app/model/MasterWallet';

@Component({
    selector: 'app-coin-list',
    templateUrl: './coin-list.page.html',
    styleUrls: ['./coin-list.page.scss'],
})
export class CoinListPage implements OnInit, OnDestroy {
    masterWallet: MasterWallet = null;
    coinList = [];
    coinListCache = {};
    payPassword: string = "";
    singleAddress: boolean = false;
    currentCoin: any;

    constructor(public walletManager: WalletManager, public popupProvider: PopupProvider,
                public native: Native, public localStorage: LocalStorage, public modalCtrl: ModalController, public events: Events) {
                    this.init();
    }

    ngOnInit() {
    }

    onSelect(item, open) {
        if (!open) {
            this.popupProvider.ionicConfirm('confirmTitle', 'text-coin-close-warning').then((data) => {
                if (data) {
                    this.switchCoin(item, open);
                }
            });
        } else {// open
            this.switchCoin(item, open);
        }
    }

    async switchCoin(item, open) {
        item.open = open;
        this.native.info(item);

        this.currentCoin = item;
        await this.native.showLoading();

        if (item.open) {
            await this.createSubWallet(item.name);
        } else {
            await this.destroySubWallet(item.name);
        }
    }

    async init() {
        this.events.subscribe("error:update", () => {
            this.currentCoin["open"] = false;
        });
        this.events.subscribe("error:destroySubWallet", () => {
            this.currentCoin["open"] = true;
        });

        this.masterWallet = this.walletManager.getMasterWallet(Config.modifyId);

        this.native.hideLoading();

        let supportedChains = await this.walletManager.spvBridge.getSupportedChains(this.masterWallet.id);
        for (let index in supportedChains) {
            let chain = supportedChains[index];
            let isOpen = (chain in this.masterWallet.subWallets);

            this.coinList.push({ name: chain, open: isOpen });
        }
    }

    async createSubWallet(chainId) {
        try {
            this.native.hideLoading();

            // Create the sub Wallet (ex: IDChain)
            await this.walletManager.createSubWallet(this.masterWallet.id, chainId);
        }
        catch (error) {
            this.currentCoin["open"] = false; // TODO: currentCoin type
        }
    }

    async destroySubWallet(chainId) {
        this.native.hideLoading();

        this.walletManager.destroySubWallet(this.masterWallet.id, chainId);
    }

    ngOnDestroy() {
        this.events.unsubscribe("error:update");
        this.events.unsubscribe("error:destroySubWallet");
    }

}
