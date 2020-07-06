import { Component, OnInit } from '@angular/core';
import { Config } from "../../../../config/Config";
import { Native } from '../../../../services/native.service';
import { ActivatedRoute } from '@angular/router';
import { WalletManager } from 'src/app/services/wallet.service';

@Component({
    selector: 'app-coin-select',
    templateUrl: './coin-select.page.html',
    styleUrls: ['./coin-select.page.scss'],
})
// TODO: remove all useless ngOnInit()
export class CoinSelectPage implements OnInit {

    public isNoData: boolean = true;
    coinList = [];
    masterWalletInfo = {};
    constructor(public route: ActivatedRoute, public native: Native, private walletManager: WalletManager) {
        this.init();
    }

    ngOnInit() {
    }

    init() {
        this.masterWalletInfo = this.walletManager.coinObj.walletInfo;
        this.coinList = this.walletManager.getSubWalletList();
        if (this.coinList.length > 0) {
            this.isNoData = false;
        }
    }

    onItem(item) {
        this.walletManager.coinObj.transfer.chainId = item.name;
        this.native.go("/recharge");
    }

}

