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

        this.availableCoins.push(new StandardCoin(StandardCoinName.ELA, "ELA", "ELA mainchain"));
        this.availableCoins.push(new StandardCoin(StandardCoinName.IDChain, "ELA-DID", "Elastos Identity sidechain"));
        this.availableCoins.push(new StandardCoin(StandardCoinName.ETHChain, "ELA-ETH", "Elastos Ethereum sidechain"));
        this.availableCoins.push(new ERC20Coin("MEC", "MyERC20Coin", "Ben's ERC20 token", "0xc4032babad2b76c39abec3c4e365611de78528ed"));
        this.availableCoins.push(new ERC20Coin("COOL", "CoolERC20Coin", "Another ERC20 token", "0xc4032babad2b76c39abec3c4e365611de78528ed"));
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
