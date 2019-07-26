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
        // this.registerBackButtonAction(/*this.tabs*/);
        this.native.showLoading().then(() => {
            this.initializeApp();
        });
    }

    registerBackButtonAction(/*tabRef:Tabs*/) {
        this.platform.backButton.subscribeWithPriority(0, () => {
            //  //按下返回键时，先关闭键盘
            //  if (this.keyboard.isOpen()) { //按下返回键时，先关闭键盘
            //   this.keyboard.close();
            //   return;
            //  };

            // let activePortal = this.ionicApp._modalPortal.getActive() ||this.ionicApp._overlayPortal.getActive();
            // if (activePortal) { //其他的关闭
            //   activePortal.dismiss().catch(() => { });
            //   activePortal.onDidDismiss(() => { });
            //   return;
            // }

            // let loadingPortal = this.ionicApp._loadingPortal.getActive();
            // if (loadingPortal) {
            //   //loading的话，返回键无效
            //   return;
            // }

            // let activeNav: NavController = this.appCtrl.getActiveNav();
            // if(activeNav.canGoBack()){
            //   activeNav.pop();
            // }else{
            //   if (tabRef == null || tabRef._selectHistory[tabRef._selectHistory.length - 1] === tabRef.getByIndex(0).id) {
            //     this.showExit();
            //   }else{
            //      //选择首页第一个的标签
            //      tabRef.select(0);
            //   }
            // }
        });
    }


    //   },1);
    // }

    //双击退出提示框
    showExit() {
        if (this.backButtonPressed) { //当触发标志为true时，即2秒内双击返回按键则退出APP
            navigator['app'].exitApp();
        } else {
            let exitmesage = this.translate.instant("text-exit-message");
            this.native.toast(exitmesage);
            this.backButtonPressed = true;
            setTimeout(() => this.backButtonPressed = false, 2000);//2秒内没有再次点击返回则将触发标志标记为false
        }
    }


    initializeApp() {
        this.load().then((data) => {
            this.successHandle(data["success"]);
        }).catch((data) => {
            this.errorHandle(data);
        });
    }

    public load(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.walletManager.getAllMasterWallets((data) => {
                if (data["success"]) {
                    resolve(data);
                } else {
                    reject(data);
                }
            });
        });
    }

    successHandle(data) {
        let idList = JSON.parse(data);
        let type = Util.GetQueryString("type");
        if (idList.length === 0) {
            Config.setMappingList({});
            this.handleNull(type);
        } else {
            this.native.info(idList);
            this.localStorage.getCurMasterId().then((data) => {
                let item = JSON.parse(data);
                this.native.info(item["masterId"]);
                if (this.isInArray(idList, item["masterId"])) {
                    Config.setCurMasterWalletId(item["masterId"]);
                    Config.setMasterWalletIdList(idList);
                    this.handleMappingdata(idList);
                    this.getAllsubWallet(item["masterId"], type);
                } else {
                    let id = idList[0];
                    Config.setCurMasterWalletId(id);
                    Config.setMasterWalletIdList(idList);
                    this.handleMappingdata(idList);
                    this.getAllsubWallet(id, type);
                }

            });

        }
    }

    public errorHandle(data) {
        let error = data["error"];
        this.native.info(error["code"]);
        if (error["code"] === 10002) {
            this.native.info(error["code"]);
            let type = Util.GetQueryString("type");
            this.handleNull(type);
        } else {
            this.native.hideLoading();
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
        this.walletManager.getAllSubWallets(masterId, (data) => {
            if (data["success"]) {

                let chinas = JSON.parse(data["success"]);
                for (let index in chinas) {
                    let chain = chinas[index];
                    this.registerWalletListener(masterId, chain);
                }

                this.native.hideLoading();
                switch (type) {
                    case "payment":
                        this.native.setRootRouter("/payment-confirm");
                        break;
                    case "did_login":
                        //TODO::DID
                        // this.native.setRootRouter(DidLoginComponent);
                        break;
                    default:
                        this.native.setRootRouter("/tabs");
                        break;
                }
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
