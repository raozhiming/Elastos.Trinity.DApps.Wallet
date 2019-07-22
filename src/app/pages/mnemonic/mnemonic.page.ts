import { Component, OnInit } from '@angular/core';
import { NavParams, Events } from '@ionic/angular';
import { Native } from '../../services/Native';
import { WalletManager } from '../../services/WalletManager';
import { Config } from '../../services/Config';
import { Util } from '../../services/Util';
import { LocalStorage } from '../../services/Localstorage';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-mnemonic',
    templateUrl: './mnemonic.page.html',
    styleUrls: ['./mnemonic.page.scss'],
})
export class MnemonicPage implements OnInit {
    masterWalletId: string = "1";
    mnemonicList = [];
    mnemonicStr: string;
    mnemonicPassword: string = "password";
    mnemonicRepassword: string = "password";
    payPassword: string;
    name: string;
    singleAddress: boolean = false;
    defaultCointype = "Ela";
    isSelect: boolean = false;
    multType: any;
    constructor(public route: ActivatedRoute,
        public walletManager: WalletManager, public native: Native, public localStorage: LocalStorage, public events: Events) {
        native.showLoading().then(() => {
            this.init();
        })
    }

    ngOnInit() {
    }

    init() {

        this.masterWalletId = Config.uuid(6, 16);
        this.walletManager.generateMnemonic(this.native.getMnemonicLang(), (data) => {
            if (data["success"]) {
                this.native.hideLoading();
                this.native.info(data);
                this.mnemonicStr = data["success"].toString();
                let mnemonicArr = this.mnemonicStr.split(/[\u3000\s]+/);
                for (var i = 0; i < mnemonicArr.length; i++) {
                    this.mnemonicList.push({ text: mnemonicArr[i], selected: false });
                }
            } else {
                this.native.info(data);
            }
        });

        this.route.queryParams.subscribe((data) => {
            this.payPassword = data["payPassword"];
            this.name = data["name"];
            this.singleAddress = data["singleAddress"];
            this.multType = JSON.parse(data["mult"]);
            console.log("--");
            console.log(this.multType);
        });

    }

    onNext() {
        if (!Util.password(this.mnemonicPassword) && this.isSelect) {
            this.native.toast_trans("text-pwd-validator");
            return;
        }

        if (this.mnemonicPassword != this.mnemonicRepassword && this.isSelect) {
            this.native.toast_trans("text-repwd-validator");
            return;
        }

        if (!this.isSelect) {
            this.mnemonicPassword = "";
            this.mnemonicRepassword = "";
        }

        if (!Util.isEmptyObject(this.multType)) {
            this.native.Go("/mnemonic-write", {
                "mult": JSON.stringify(this.multType),
                mnemonicStr: this.mnemonicStr,
                mnemonicList: JSON.stringify(this.mnemonicList),
                "totalCopayers": this.multType["totalCopayers"],
                "requiredCopayers": this.multType["requiredCopayers"],
                "mnemonicPassword": this.mnemonicPassword,
                "payPassword": this.payPassword,
                name: this.name
            });
            return;
        }
        this.native.showLoading().then(() => {
            this.walletManager.createMasterWallet(this.masterWalletId, this.mnemonicStr, this.mnemonicPassword, this.payPassword, this.singleAddress, (data) => {
                if (data["success"]) {
                    this.native.info(data);
                    this.createSubWallet('ELA');
                } else {
                    this.native.info(data);
                }
            });

        });

    }

    createSubWallet(chainId) {
        // Sub Wallet
        this.walletManager.createSubWallet(this.masterWalletId, chainId, 0, (data) => {
            if (data["success"]) {
                let walletObj = this.native.clone(Config.masterWallObj);
                walletObj["id"] = this.masterWalletId;
                walletObj["wallname"] = this.name;
                walletObj["Account"] = { "SingleAddress": this.singleAddress, "Type": "Standard" };
                this.localStorage.saveMappingTable(walletObj).then((data) => {
                    let mappingList = this.native.clone(Config.getMappingList());
                    mappingList[this.masterWalletId] = walletObj;
                    this.native.info(mappingList);
                    Config.setMappingList(mappingList);
                    this.saveWalletList();
                    this.registerWalletListener(this.masterWalletId, chainId);

                });
            } else {
                alert("createSubWallet=error:" + JSON.stringify(data));
            }
        });
    }

    saveWalletList() {
        Config.getMasterWalletIdList().push(this.masterWalletId);
        this.localStorage.saveCurMasterId({ masterId: this.masterWalletId }).then((data) => {
            this.native.hideLoading();
            Config.setCurMasterWalletId(this.masterWalletId);
            this.native.Go("/mnemonic-write", { mnemonicStr: this.mnemonicStr, mnemonicList: JSON.stringify(this.mnemonicList) });
        });
    }

    registerWalletListener(masterId, coin) {
        this.walletManager.registerWalletListener(masterId, coin, (data) => {
            if (!Config.isResregister(masterId, coin)) {
                Config.setResregister(masterId, coin, true);
            }
            this.events.publish("register:update", masterId, coin, data);
            //this.saveWalletList();
        });
    }

    onChangeSelect(select) {
        this.isSelect = select;
    }
}

