import { Component, OnInit } from '@angular/core';
import { Config } from "../../../../config/Config";
import { Native } from '../../../../services/native.service';
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
        this.coinList = Config.getSubWalletList();
        if (this.coinList.length > 0) {
            this.isNoData = false;
        }
    }

    onItem(item) {
        Config.coinObj.transfer.chainId = item.name;
        this.native.go("/recharge");
    }

}

