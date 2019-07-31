import { Component, OnInit } from '@angular/core';
import { ModalController, Events } from '@ionic/angular';
import { WalletManager } from '../../../services/WalletManager';
import { Native } from '../../../services/Native';
import { LocalStorage } from '../../../services/Localstorage';
import { Config } from '../../../services/Config';

@Component({
    selector: 'app-coin-list',
    templateUrl: './coin-list.page.html',
    styleUrls: ['./coin-list.page.scss'],
})
export class CoinListPage implements OnInit {
    masterWalletId: string = "1";
    coinList = [];
    coinListCache = {};
    payPassword: string = "";
    singleAddress: boolean = false;
    currentCoin: any;
    constructor(public walletManager: WalletManager,
        public native: Native, public localStorage: LocalStorage, public modalCtrl: ModalController, public events: Events) {
        this.init();
    }

    ngOnInit() {
    }

    onSelect(item, open) {
        item.open = open;
        this.native.info(item);
        if (item.open) {
            this.currentCoin = item;
            this.native.showLoading().then(() => {
                this.createSubWallet();
            });
        }
        else {
            this.native.showLoading().then(() => {
                this.walletManager.destroySubWallet(this.masterWalletId, item.name, (data) => {
                    if (data['success']) {
                        this.native.hideLoading();
                        Config.setResregister(this.masterWalletId, item.name, false);
                        let subWallet = Config.getSubWallet(this.masterWalletId);
                        delete (subWallet[item.name]);
                        let walletObj = this.native.clone(Config.masterWallObj);
                        walletObj["id"] = this.masterWalletId;
                        walletObj["wallname"] = Config.getWalletName(this.masterWalletId);
                        walletObj["Account"] = Config.getAccountType(this.masterWalletId);
                        walletObj["coinListCache"] = subWallet;
                        this.localStorage.saveMappingTable(walletObj).then((data) => {
                            let mappingList = this.native.clone(Config.getMappingList());
                            mappingList[this.masterWalletId] = walletObj;
                            this.native.info(mappingList);
                            Config.setMappingList(mappingList);
                        });
                    }
                });
            });
        }
    }

    init() {
        this.events.subscribe("error:update", () => {
            this.currentCoin["open"] = false;
        });
        this.events.subscribe("error:destroySubWallet", () => {
            this.currentCoin["open"] = true;
        });
        // this.masterWalletId = Config.getCurMasterWalletId();
        this.masterWalletId = Config.modifyId;
        let subWallet = Config.getSubWallet(this.masterWalletId);
        this.walletManager.getSupportedChains(this.masterWalletId, (data) => {
            if (data['success']) {
                this.native.info(data);
                this.native.hideLoading();
                let allChains = data['success'];
                for (let index in allChains) {
                    let chain = allChains[index];
                    let isOpen = false;
                    if (subWallet) {
                        isOpen = chain in subWallet ? true : false;
                    }
                    if (chain == "ELA") {
                        isOpen = true;
                    }
                    this.coinList.push({ name: chain, open: isOpen });
                }
            } else {
                this.native.info(data);
            }
        });
        //});
    }

    createSubWallet() {
        // Sub Wallet IdChain
        let chainId = this.currentCoin["name"];
        this.walletManager.createSubWallet(this.masterWalletId, chainId, 0, (data) => {
            if (data['success']) {
                if (!Config.isResregister(this.masterWalletId, chainId)) {
                    this.registerWalletListener(this.masterWalletId, chainId);
                }
                this.native.hideLoading();
                let coin = this.native.clone(Config.getSubWallet(this.masterWalletId));
                if (coin) {
                    coin[chainId] = { id: chainId };
                } else {
                    coin = {};
                    coin[chainId] = { id: chainId };
                }

                let walletObj = this.native.clone(Config.masterWallObj);
                walletObj["id"] = this.masterWalletId;
                walletObj["wallname"] = Config.getWalletName(this.masterWalletId);
                walletObj["Account"] = Config.getAccountType(this.masterWalletId);
                walletObj["coinListCache"] = coin;
                this.localStorage.saveMappingTable(walletObj).then((data) => {
                    let mappingList = this.native.clone(Config.getMappingList());
                    mappingList[this.masterWalletId] = walletObj;
                    Config.setMappingList(mappingList);
                });
            } else {
                this.currentCoin["open"] = false;
                this.native.info(data);
            }
        });
    }

    ionViewDidLeave() {
        this.events.unsubscribe("error:update");
        this.events.unsubscribe("error:destroySubWallet");
    }

    registerWalletListener(masterId, coin) {
        this.walletManager.registerWalletListener(masterId, coin, (data) => {
            //if(!Config.isResregister){
            Config.setResregister(masterId, coin, true);
            //}
            this.events.publish("register:update", masterId, coin, data);
        });
    }

}
