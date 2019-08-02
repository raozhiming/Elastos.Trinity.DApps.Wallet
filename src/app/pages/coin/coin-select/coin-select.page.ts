import { Component, OnInit } from '@angular/core';
import { Config } from "../../../services/Config";
import { Util } from "../../../services/Util";
import { Native } from '../../../services/Native';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-coin-select',
    templateUrl: './coin-select.page.html',
    styleUrls: ['./coin-select.page.scss'],
})
export class CoinSelectPage implements OnInit {

    public isNoData: boolean = true;
    coinList = [];
    masterWalletInfo = {};
    constructor(public route: ActivatedRoute, public native: Native) {
        this.init();
    }

    ngOnInit() {
    }

    init() {
        this.masterWalletInfo = Config.coinObj.walletInfo;
        let mastId = Config.getCurMasterWalletId();
        let subwallet = Config.getSubWallet(mastId);
        if (subwallet) {
            if (!Util.isEmptyObject(subwallet)) {
                for (let coin in subwallet) {
                    if (coin != 'ELA') {
                        this.coinList.push({ name: coin });
                    }
                }
                console.log(this.coinList.length);
                if (this.coinList.length > 0) {
                    this.isNoData = false;
                }
            }
        }
    }

    onItem(item) {
        Config.coinObj.transfer.chainId = item.name;
        this.native.Go("/recharge");
    }

}

