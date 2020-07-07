import { Component, OnInit } from '@angular/core';
import { Config } from "../../../../config/Config";
import { Native } from '../../../../services/native.service';
import { ActivatedRoute } from '@angular/router';
import { WalletManager } from 'src/app/services/wallet.service';
import { SubWallet } from 'src/app/model/SubWallet';
import { CoinName } from 'src/app/model/MasterWallet';

@Component({
    selector: 'app-coin-select',
    templateUrl: './coin-select.page.html',
    styleUrls: ['./coin-select.page.scss'],
})
// TODO: remove all useless ngOnInit() in all screens
export class CoinSelectPage implements OnInit {
    public subWallets: SubWallet[] = [];

    constructor(public route: ActivatedRoute, public native: Native, private walletManager: WalletManager) {
        this.init();
    }

    ngOnInit() {
    }

    init() {        
        // Note: we are willing to pick a sidechain subwallet here only.
        this.subWallets = this.walletManager.getActiveMasterWallet().subWalletsWithExcludedCoin(CoinName.ELA);
    }

    onItem(item) {
        this.walletManager.coinObj.transfer.chainId = item.name;
        this.native.go("/recharge");
    }

}

