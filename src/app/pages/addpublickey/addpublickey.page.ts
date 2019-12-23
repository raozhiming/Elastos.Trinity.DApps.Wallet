import { Component, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';
import { WalletManager } from '../../services/WalletManager';
import { Native } from '../../services/Native';
import { Config } from '../../services/Config';
import { LocalStorage } from '../../services/Localstorage';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-addpublickey',
    templateUrl: './addpublickey.page.html',
    styleUrls: ['./addpublickey.page.scss'],
})
export class AddpublickeyPage implements OnInit {
    masterWalletId: string = "1";
    private msobj: any;
    public publicKeyArr: any = [];
    public name: string = "";
    public isOnly: any;
    public innerType: any;
    public curIndex = 0;
    public qrcode: string = null;
    constructor(public route: ActivatedRoute, public walletManager: WalletManager, public native: Native, public localStorage: LocalStorage, public events: Events) {
        // this.route.queryParams.subscribe((data) => {
        //     this.native.info(data);
        //     console.log(data);
        //     this.msobj = data;
        // this.name = this.msobj["name"];
        this.name = Config.walletObj.name;
        this.msobj = Config.walletObj

        let totalCopayers = Config.walletObj.totalCopayers;
        if (Config.walletObj.payPassword) {
            this.isOnly = false;
            this.innerType = "Standard";
            totalCopayers = totalCopayers - 1;
            this.getPublicKey();
        } else {
            this.isOnly = true;
            this.innerType = "Readonly";
            // totalCopayers = this.msobj["totalCopayers"];
        }

        for (let index = 0; index < totalCopayers; index++) {
            let item = { index: index, publicKey: "" };
            this.publicKeyArr.push(item);
        }
        // });

        this.masterWalletId = Config.uuid(6, 16);

        this.events.subscribe("publickey:update", (val) => {
            this.publicKeyArr[this.curIndex]['publicKey'] = val;
        });
    }

    ngOnInit() {
        console.log('ngOnInit AddpublickeyPage');
    }

    saomiao(index) {
        this.curIndex = index;
        this.native.go("/scan", { "pageType": "5" });
    }

    isRepeat(arr) {
        var hash = {};
        for (var i in arr) {
            if (hash[arr[i]]) {
                return true;
            }
            // 不存在该元素，则赋值为true，可以赋任意值，相应的修改if判断条件即可
            hash[arr[i]] = true;
        }
        return false;
    }

    onNext() {
        let copayers = this.getTotalCopayers();
        //this.native.info(copayers);
        //this.native.info(this.isRepeat(copayers));
        if (this.isRepeat(JSON.parse(copayers))) {
            this.native.toast_trans("publickey-repeat");
            return;
        }
        this.native.showLoading().then(() => {
            if (Config.walletObj.payPassword) {
                this.createWalletWithMnemonic();
            } else {
                this.createWallet();
            }
        });
    }

    createWallet() {
        let copayers = this.getTotalCopayers();
        this.walletManager.createMultiSignMasterWallet(this.masterWalletId, copayers, this.msobj["requiredCopayers"], (data) => {
            this.createSubWallet("ELA");
        });
    }

    getTotalCopayers() {
        let arr = [];
        for (let index = 0; index < this.publicKeyArr.length; index++) {
            let item = this.publicKeyArr[index];
            let publicKey = item["publicKey"].replace(/^\s+|\s+$/g, "");
            arr.push(publicKey);
        }
        return JSON.stringify(arr);
    }

    createSubWallet(chainId) {
        // Sub Wallet
        this.walletManager.createSubWallet(this.masterWalletId, chainId, () => {
            this.registerWalletListener(this.masterWalletId, chainId);
            this.saveWalletList();
        });
    }

    saveWalletList() {
        Config.getMasterWalletIdList().push(this.masterWalletId);
        this.localStorage.saveCurMasterId({ masterId: this.masterWalletId }).then((data) => {
            let walletObj = this.native.clone(Config.masterWallObj);
            walletObj["id"] = this.masterWalletId;
            walletObj["wallname"] = this.name;
            walletObj["account"] = { "SingleAddress": true, "Type": "Multi-Sign", "InnerType": this.innerType };
            this.localStorage.saveMappingTable(walletObj).then((data) => {
                let mappingList = this.native.clone(Config.getMappingList());
                mappingList[this.masterWalletId] = walletObj;
                this.native.info(mappingList);
                Config.setMappingList(mappingList);
                this.native.hideLoading();
                this.native.setRootRouter("/tabs/tab-home", {"masterId": this.masterWalletId});
                this.events.publish("wallet:update", this.masterWalletId);
            });
        });
    }

    createWalletWithMnemonic() {
        let copayers = this.getTotalCopayers();
        this.walletManager.createMultiSignMasterWalletWithMnemonic(this.masterWalletId,
            this.msobj["mnemonicStr"], this.msobj["mnemonicPassword"], this.msobj["payPassword"], copayers, this.msobj["requiredCopayers"], (data) => {
                this.createMnemonicSubWallet("ELA", this.msobj["payPassword"]);
            });
    }

    createMnemonicSubWallet(chainId, password) {
        // Sub Wallet
        this.walletManager.createSubWallet(this.masterWalletId, chainId, () => {
            this.registerWalletListener(this.masterWalletId, chainId);
            this.saveWalletList();
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

    getPublicKey() {

        // this.walletManager.getMultiSignPubKeyWithMnemonic(this.msobj["mnemonicStr"], this.msobj["mnemonicPassword"],
        //     (ret) => { this.qrcode = ret; });
    }

}

