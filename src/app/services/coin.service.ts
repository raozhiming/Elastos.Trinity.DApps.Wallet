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

@Injectable({
    providedIn: 'root'
})
export class CoinService {
    private availableCoins: Coin[] = null;

    constructor() {
        this.initializeCoinList();
    }

    private initializeCoinList() {
        this.availableCoins = [];

        this.availableCoins.push(new StandardCoin(StandardCoinName.ELA, "ELA", "Elastos"));
        this.availableCoins.push(new StandardCoin(StandardCoinName.IDChain, "ELA/ID", "Elastos DID"));
        this.availableCoins.push(new StandardCoin(StandardCoinName.ETHSC, "ELA/ETHSC", "Elastos ETH"));
        this.availableCoins.push(new ERC20Coin("MEC", "MEC", "Ben's ERC20 token", "0xc4032babad2b76c39abec3c4e365611de78528ed"));
        this.availableCoins.push(new ERC20Coin("COOL", "COOL", "Another ERC20 token", "0xc4032babad2b76c39abec3c4e365611de78528ed"));
        this.availableCoins.push(new ERC20Coin("TTECH", "TTECH", "Trinity Tech Demo", "0xa4e4a46b228f3658e96bf782741c67db9e1ef91c"));
    }

    public getAvailableCoins(): Coin[] {
        return this.availableCoins;
    }

    public getCoinByID(id: CoinID): Coin {
        return this.availableCoins.find((c)=>{
            return c.getID() == id;
        });
    }
}
