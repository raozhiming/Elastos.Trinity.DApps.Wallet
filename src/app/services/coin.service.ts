/*
 * Copyright (c) 2020 Elastos Foundation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Injectable } from '@angular/core';
import { Coin, CoinID, ERC20Coin, StandardCoin } from '../model/Coin';
import { StandardCoinName } from '../model/Coin';
import { LocalStorage } from './storage.service';
import { Events } from '@ionic/angular';
import { MasterWallet } from '../model/wallets/MasterWallet';
import { NetworkType } from '../model/NetworkType';
import { PrefsService } from './prefs.service';

@Injectable({
    providedIn: 'root'
})
export class CoinService {
    private availableCoins: Coin[] = null;
    private activeNetwork: NetworkType;

    constructor(private storage: LocalStorage, private events: Events, private prefs: PrefsService) {
    }

    public async init() {
        this.availableCoins = [];

        this.activeNetwork = await this.prefs.getActiveNetworkType();

        // Standard tokens
        this.availableCoins.push(new StandardCoin(StandardCoinName.ELA, "ELA", "Elastos"));
        this.availableCoins.push(new StandardCoin(StandardCoinName.IDChain, "ELA/ID", "Elastos DID"));
        this.availableCoins.push(new StandardCoin(StandardCoinName.ETHSC, "ELA/ETHSC", "Elastos ETH"));

        // ERC20 tokens
        this.availableCoins.push(new ERC20Coin("TTECH", "TTECH", "Trinity Tech", "0xa4e4a46b228f3658e96bf782741c67db9e1ef91c", NetworkType.MainNet));
        this.availableCoins.push(new ERC20Coin("TTECH", "TTECH", "Trinity Tech", "0xfdce7fb4050cd43c654c6cecead950343990ce75", NetworkType.TestNet));

        await this.addCustomERC20CoinsToAvailableCoins();

        console.log("Available coins:", this.availableCoins);
    }

    public getAvailableCoins(): Coin[] {
        // Return only coins that are usable on the active network.
        return this.availableCoins.filter(c => {
            return c.network == null || c.network == this.activeNetwork;
        });
    }

    public getCoinByID(id: CoinID): Coin {
        return this.getAvailableCoins().find((c)=>{
            return c.getID() == id;
        });
    }

    /**
     * Adds a custom ERC20 coin to the list of available coins.
     * If activateInWallet is passed, the coin is automatically added to that wallet.
     */
    public async addCustomERC20Coin(coin: ERC20Coin, activateInWallet?: MasterWallet) {
        console.log("Add coin to custom ERC20 coins list", coin);

        let existingCoins = await this.getCustomERC20Coins();
        existingCoins.push(coin);

        // Add to the available coins list
        this.availableCoins.push(coin);

        // Save to permanent storage
        await this.storage.set("custom-erc20-coins", existingCoins);

        // If needed, activate this new coin in the given wallet
        if (activateInWallet) {
            await activateInWallet.createSubWallet(coin);
        }

        this.events.publish("custom-coin-added", coin.getID());
    }

    public async  getCustomERC20Coins(): Promise<ERC20Coin[]> {
        let rawCoinList = await this.storage.get("custom-erc20-coins");
        if (!rawCoinList)
            return [];

        let customCoins: ERC20Coin[] = [];
        for (let rawCoin of rawCoinList) {
            customCoins.push(ERC20Coin.fromJson(rawCoin));
        }

        return customCoins;
    }

    /**
     * Appens all custom ERC20 coins to the list of available coins.
     */
    private async addCustomERC20CoinsToAvailableCoins() {
        let existingCoins = await this.getCustomERC20Coins();

        for (let coin of existingCoins) {
            this.availableCoins.push(coin);
        }
    }
}
