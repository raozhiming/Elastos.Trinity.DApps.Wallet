import { Component, OnInit, ViewChildren } from '@angular/core';

import { Events, Platform, } from '@ionic/angular';
import { WalletManager } from '../../services/WalletManager';
import { Native } from '../../services/Native';
import { Util } from '../../services/Util';
import { Config } from '../../services/Config';
import { LocalStorage } from '../../services/Localstorage';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-initialize',
    templateUrl: './initialize.page.html',
    styleUrls: ['./initialize.page.scss'],
})
export class InitializePage implements OnInit {
    // @ViewChildren('myTabs') tabs:Tabs;
    backButtonPressed: boolean = false;  //用于判断返回键是否触发

    constructor(/*public appCtrl: App,*/private platform: Platform,
        public walletManager: WalletManager, public native: Native,
        public localStorage: LocalStorage, public events: Events, private translate: TranslateService/*,
    public keyboard: Keyboard, public ionicApp: IonicApp*/) {

    }

    ngOnInit() {
        this.native.showLoading().then(() => {
            this.initializeApp();
        });
    }

    initializeApp() {
        this.load().then((data) => {
            Config.initialized = true;
            this.successHandle(data);
        }).catch((data) => {
            Config.initialized = true;
            this.errorHandle(data);
        });
    }

    public load(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.walletManager.getAllMasterWallets((ret) => resolve(ret), (err) => reject(err));
        });
    }

    successHandle(data) {
        let idList = data;
        let type = Util.GetQueryString("type");
        if (idList.length === 0) {
            Config.setMappingList({});
            this.handleNull(type);
        } else {
            this.native.info(idList);
            this.localStorage.getCurMasterId((data) => {
                var id = idList[0];
                if (this.isInArray(idList, data["masterId"])) {
                    id = data["masterId"];
                }
                Config.setCurMasterWalletId(id);
                Config.setMasterWalletIdList(idList);
                this.handleMappingdata(idList);
                this.getAllsubWallet(id, type);

            });

        }
    }

    public errorHandle(error) {
        if (error["code"] === 10002) {
            let type = Util.GetQueryString("type");
            this.handleNull(type);
        }
    }

    handleNull(type) {
        if (type == 'payment') {
            let account = Util.GetQueryString("account");
            let toAddress = Util.GetQueryString("address");
            let memo = Util.GetQueryString("memo");
            let payment_params = {
                account: account,
                toAddress: toAddress,
                memo: memo
            }
            this.localStorage.set('payment', payment_params).then(() => {
                this.native.hideLoading();
                Config.setMasterWalletIdList([]);
                this.native.setRootRouter('/launcher');
            });
        } else {
            this.native.hideLoading();
            Config.setMasterWalletIdList([]);
            this.native.setRootRouter('/launcher');
        }
    }

    handleMappingdata(idList) {
        let mappList = Config.getMappingList();
        let list = {};
        for (let index in idList) {
            let id = idList[index];
            list[id] = mappList[id];
        }
        Config.setMappingList(list);
        this.native.info(Config.getMappingList());
    }

    getAllsubWallet(masterId, type) {
        this.walletManager.getAllSubWallets(masterId, (ret) => {
            let chinas = ret;
            for (let index in chinas) {
                let chain = chinas[index];
                alert(index + ":" + chain);
                this.registerWalletListener(masterId, chain);
            }

            this.native.hideLoading();
            switch (type) {
                case "payment":
                    this.native.setRootRouter("/payment-confirm");
                    break;
                default:
                    this.native.setRootRouter("/tabs");
                    break;
            }
        });
    }

    registerWalletListener(masterId, coin) {

        this.walletManager.registerWalletListener(masterId, coin, (data) => {
            if (!Config.isResregister(masterId, coin)) {
                Config.setResregister(masterId, coin, true);
            }
            this.events.publish("register:update", masterId, coin, data);
        });
    }

    isInArray(arr, value) {
        for (var i = 0; i < arr.length; i++) {
            if (value === arr[i]) {
                return true;
            }
        }
        return false;
    }
}
