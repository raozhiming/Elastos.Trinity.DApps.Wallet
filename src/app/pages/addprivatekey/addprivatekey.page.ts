import { Component, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';
import { WalletManager } from '../../services/WalletManager';
import { Native } from '../../services/Native';
import { Config } from '../../services/Config';
import { LocalStorage } from '../../services/Localstorage';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-addprivatekey',
    templateUrl: './addprivatekey.page.html',
    styleUrls: ['./addprivatekey.page.scss'],
})

export class AddprivatekeyPage implements OnInit {
    masterWalletId: string = "1";
    public publicKey: string = "";
    private msobj: any;
    public publicKeyArr: any = [];
    public name: string = "";
    public curIndex = 0;
    public qrcode: string = null;
    constructor(public route: ActivatedRoute, public walletManager: WalletManager, public native: Native, public localStorage: LocalStorage, public events: Events) {
        this.route.queryParams.subscribe((data) => {
            this.native.info(data);
            this.msobj = data;
            this.name = this.msobj["name"];
        });

        let totalCopayers = this.msobj["totalCopayers"];
        for (let index = 0; index < totalCopayers - 1; index++) {
            let item = { index: index, publicKey: this.publicKey };
            this.publicKeyArr.push(item);
        }

        this.masterWalletId = Config.uuid(6, 16);
        this.getMultiSignPubKeyWithPrivKey();
        this.events.subscribe("privatekey:update", (val) => {
            this.publicKeyArr[this.curIndex]['publicKey'] = val;
        });
    }

    ngOnInit() {
        console.log('ngOnInit AddprivatekeyPage');
    }

    copy() {
        this.native.copyClipboard(this.qrcode);
        this.native.toast_trans('copy-ok');
    }

    saomiao(index) {
        this.curIndex = index;
        console.log("saomiao=" + index);
        this.native.go("/scan", { "pageType": "6" });
    }

    onNext() {
        this.native.showLoading().then(() => {
            this.createWallet();
        });
    }

    createWallet() {
        let copayers = this.getTotalCopayers();
        this.walletManager.createMultiSignMasterWalletWithPrivKey(this.masterWalletId, this.msobj["importText"], this.msobj["passWord"], copayers, this.msobj["requiredCopayers"],
            (data) => {
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
        this.walletManager.createSubWallet(this.masterWalletId, chainId, 0, () => {
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
            walletObj["Account"] = { "SingleAddress": true, "Type": "Multi-Sign", "InnerType": "Simple" };
            this.localStorage.saveMappingTable(walletObj).then((data) => {
                let mappingList = this.native.clone(Config.getMappingList());
                mappingList[this.masterWalletId] = walletObj;
                this.native.info(mappingList);
                Config.setMappingList(mappingList);
                this.native.hideLoading();
                Config.setCurMasterWalletId(this.masterWalletId);
                this.native.setRootRouter("/tabs");
                this.events.publish("wallet:update", this.masterWalletId);
            });

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

    getMultiSignPubKeyWithPrivKey() {
        this.walletManager.getMultiSignPubKeyWithPrivKey(this.msobj["importText"], (ret) => {
            this.qrcode = ret;
        });
    }

}
