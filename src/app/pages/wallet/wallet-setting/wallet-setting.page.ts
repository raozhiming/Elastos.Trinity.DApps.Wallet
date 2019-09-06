import { Component, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';
import { LocalStorage } from '../../../services/Localstorage';
import { PopupProvider } from "../../../services/popup";
import { WalletManager } from '../../../services/WalletManager';
import { Native } from '../../../services/Native';
import { ActivatedRoute } from '@angular/router';
import { Config } from "../../../services/Config";

@Component({
    selector: 'app-wallet-setting',
    templateUrl: './wallet-setting.page.html',
    styleUrls: ['./wallet-setting.page.scss'],
})
export class WalletSettingPage implements OnInit {

    walletName = "";
    masterWalletId: string = "1";
    public currentLanguageName: string = "";
    public readonly: string = "";
    public masterWalletType: string = "";
    public singleAddress: boolean = false;
    constructor(public route: ActivatedRoute, public events: Events,
        public localStorage: LocalStorage, public popupProvider: PopupProvider, public walletManager: WalletManager,
    /*private app: App,*/ public native: Native) {

        this.route.paramMap.subscribe((params) => {
            this.masterWalletId = params.get("id");
            Config.modifyId = this.masterWalletId;
            this.walletName = Config.getWalletName(this.masterWalletId);
            this.getMasterWalletBasicInfo();
        });
    }

    ngOnInit() {
    }

    ionViewWillEnter() {
        this.walletName = Config.getWalletName(this.masterWalletId);
    }

    ionViewDidLeave() {
        //this.walletName = Config.getWalletName(this.masterWalletId);
    }

    // onItem(i) {
    //     switch (i) {
    //         case 0:
    //             this.native.go("/exprot-prikey");
    //             break;
    //         case 1:
    //             this.native.go("/paypassword-reset");
    //             break;
    //         case 2:
    //             this.popupProvider.ionicConfirm('confirmTitle', 'confirmSubTitle').then((data) => {
    //                 if (data) {
    //                     this.native.showLoading().then(() => {
    //                         this.destroyWallet(this.masterWalletId);
    //                     });
    //                 }
    //             });
    //             break;
    //         case 3:
    //             this.native.go("/publickey");
    //             break;
    //         case 4:
    //             this.native.go("/modifywalletname");
    //             break;
    //         case 5:
    //             this.native.go("/exportmnemomic");
    //             break;
    //     }
    // }

    onDelete() {
        this.popupProvider.ionicConfirm('confirmTitle', 'confirmSubTitle').then((data) => {
            if (data) {
                this.native.showLoading().then(() => {
                    this.destroyWallet(this.masterWalletId);
                });
            }
        });
    }


    getAllCreatedSubWallets() {

        this.walletManager.getAllSubWallets(this.masterWalletId, (ret) => {
            let chinas = ret;
            let maxLen = chinas.length;
            for (let index in chinas) {
                let chain = chinas[index];
                this.destroyWalletListener(index, maxLen, this.masterWalletId, chain);
            }

        });

    }

    destroyWalletListener(index, maxLen, masterWalletId, chainId) {
        this.walletManager.removeWalletListener(masterWalletId, chainId, (ret) => {
            if (parseInt(index) === (maxLen - 1)) {
                this.destroyWallet(masterWalletId);
            }
        });
    }

    destroyWallet(masterWalletId: string) {
        //this.localStorage.remove('coinListCache').then(()=>{
        this.walletManager.destroyWallet(masterWalletId, () => {
            this.delWalletListOne(masterWalletId);
        });
        //});
    }

    delWalletListOne(masterWalletId) {
        this.native.info(masterWalletId);
        let arr = Config.getMasterWalletIdList();
        let index = arr.indexOf(masterWalletId);
        this.native.info(index);
        if (index > -1) {
            arr.splice(index, 1);
        }

        if (arr.length === 0) {
            this.saveWalletList1();
            return;
        }
        this.native.info(arr);
        Config.setCurMasterWalletId(arr[0]);
        //Config.setMasterWalletIdList(arr);
        let allmastwalle = this.native.clone(Config.getMappingList());
        delete (allmastwalle[this.masterWalletId]);
        this.native.info(allmastwalle);
        Config.setMappingList(allmastwalle);
        this.saveWalletList(arr[0]);
    }

    saveWalletList(masterWalletId) {
        this.localStorage.saveCurMasterId({ masterId: masterWalletId }).then((data) => {
            this.native.hideLoading();
            Config.setCurMasterWalletId(masterWalletId);
            this.native.setRootRouter("/tabs");
            this.events.publish("wallet:update", masterWalletId);
        });
    }

    saveWalletList1() {
        this.native.hideLoading();
        Config.setMappingList({});
        this.native.setRootRouter("/launcher");
    }

    getMasterWalletBasicInfo() {
        this.walletManager.getMasterWalletBasicInfo(this.masterWalletId, (ret) => {
            this.masterWalletType = ret["Type"];
            this.singleAddress = ret["SingleAddress"];
            this.readonly = ret["InnerType"] || "";
        });
    }
}
