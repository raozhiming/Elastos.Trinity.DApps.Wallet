import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, Events } from '@ionic/angular';
import { Config } from '../../../../config/Config';
import { LocalStorage } from '../../../../services/storage.service';
import { Native } from '../../../../services/native.service';
import { PopupProvider} from '../../../../services/popup.Service';
import { WalletManager } from '../../../../services/wallet.service';

@Component({
    selector: 'app-coin-list',
    templateUrl: './coin-list.page.html',
    styleUrls: ['./coin-list.page.scss'],
})
export class CoinListPage implements OnInit, OnDestroy {
    masterWalletId: string = "1";
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
        // this.masterWalletId = Config.getCurMasterWalletId();
        this.masterWalletId = Config.modifyId;
        // let subWallet = Config.getSubWallet(this.masterWalletId);
        
        let supportedChains = await this.walletManager.getSupportedChains(this.masterWalletId);
        this.native.hideLoading();
        let subWallet = Config.masterManager.masterWallet[this.masterWalletId].chainList;
        for (let index in supportedChains) {
            let chain = supportedChains[index];
            let isOpen = false;
            if (chain == "ELA") {
                isOpen = true;
            }
            else if (subWallet) {
                isOpen =  subWallet.indexOf(chain) != -1;
            }
            this.coinList.push({ name: chain, open: isOpen });
        }
    }

    async createSubWallet(chainId) {
        try {
            // Sub Wallet IDChain
            await this.walletManager.createSubWallet(this.masterWalletId, chainId);

            this.native.hideLoading();
            Config.masterManager.addSubWallet(this.masterWalletId, chainId);
            Config.masterManager.saveInfos();

            this.walletManager.syncStart(this.masterWalletId, chainId);
        }
        catch (error) {
            this.currentCoin["open"] = false;
        }
    }

    async destroySubWallet(chainId) {
        await this.walletManager.destroySubWallet(this.masterWalletId, chainId);
        
        Config.masterManager.removeSubWallet(this.masterWalletId, chainId);
        Config.masterManager.saveInfos();
        this.native.hideLoading();
    }

    ngOnDestroy() {
        this.events.unsubscribe("error:update");
        this.events.unsubscribe("error:destroySubWallet");
    }

}
