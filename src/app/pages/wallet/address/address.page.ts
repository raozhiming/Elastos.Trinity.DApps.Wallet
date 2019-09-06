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
    curCount = 0;

    constructor(public route: ActivatedRoute, public walletManager: WalletManager, public events: Events, public native: Native) {
        this.init();
    }

    ngOnInit() {
    }

    init() {
        this.masterWalletId = Config.getCurMasterWalletId();
        this.route.queryParams.subscribe((data) => {
            this.chainId = data["chainId"];
            this.getAddressList(null);
        });
    }

    getAddressList(infiniteScroll: any) {
        this.walletManager.getAllAddress(this.masterWalletId, this.chainId, this.curCount, (ret) => {
            let addresses = ret['Addresses'];
            let maxCount = ret['MaxCount'];
            var disabled = true;
            if (addresses) {
                if (this.curCount != 0) {
                    this.addrList = this.addrList.concat(addresses);
                } else {
                    this.addrList = addresses;
                }

                this.curCount = this.curCount + 20;
                if (this.curCount < maxCount) {
                    disabled = false;
                }
            }

            if (infiniteScroll != null) {
                infiniteScroll.complete();
                infiniteScroll.disabled = disabled;
            }
            if (disabled) {
                this.native.toast_trans("load-finish");
            }
        });
    }

    onItem(item) {
        this.native.copyClipboard(item);
        this.native.toast_trans('copy-ok');
    }

    doInfinite(event) {
        setTimeout(() => {
            this.getAddressList(event.target);
        }, 500);
    }
}
