import { Component, OnInit } from '@angular/core';
import { Config } from '../../../services/Config';
import { Events } from '@ionic/angular';
import { WalletManager } from '../../../services/WalletManager';
import { Native } from '../../../services/Native';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-address',
    templateUrl: './address.page.html',
    styleUrls: ['./address.page.scss'],
})
export class AddressPage implements OnInit {
    masterWalletId: string = "1";
    addrList = [];
    chainId: string;
    pageNo = 0;
    start = 0;
    infinites;
    MaxCount;
    constructor(public route: ActivatedRoute, public walletManager: WalletManager, public events: Events, public native: Native) {
        this.init();
    }

    ngOnInit() {
    }

    init() {
        this.masterWalletId = Config.getCurMasterWalletId();
        this.route.queryParams.subscribe((data) => {
            this.chainId = data["chainId"];
            this.getAddressList();
        });
    }

    getAddressList() {
        this.walletManager.getAllAddress(this.masterWalletId, this.chainId, this.start, (data) => {
            if (data["success"]) {
                this.native.info(data);
                let address = JSON.parse(data["success"])['Addresses'];
                this.MaxCount = JSON.parse(data["success"])['MaxCount'];
                if (!address) {
                    this.infinites.enable(false);
                    return;
                }
                if (this.pageNo != 0) {
                    this.addrList = this.addrList.concat(JSON.parse(data["success"])['Addresses']);
                } else {
                    this.addrList = JSON.parse(data["success"])['Addresses'];
                }
            } else {
                alert("==getAllAddress==error" + JSON.stringify(data))
            }
        });
    }

    onItem(item) {
        this.native.copyClipboard(item);
        this.native.toast_trans('copy-ok');
    }

    // doRefresh(refresher){
    //    this.pageNo = 0;
    //    this.start = 0;
    //    this.getAddressList();
    //    setTimeout(() => {
    //     refresher.complete();
    //     //toast提示
    //     this.native.toast("加载成功");
    // },2000);
    // }

    doInfinite(infiniteScroll) {
        this.infinites = infiniteScroll;
        setTimeout(() => {
            this.pageNo++;
            this.start = this.pageNo * 20;
            if (this.start >= this.MaxCount) {
                this.infinites.enable(false);
                return;
            }
            this.getAddressList();
            infiniteScroll.complete();
        }, 500);
    }
}
