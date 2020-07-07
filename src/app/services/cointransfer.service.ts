/*
 * Copyright (c) 2019 Elastos Foundation
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
import { CoinName } from '../model/MasterWallet';
import { WalletAccount } from '../model/WalletAccount';

export class Transfer {
    action: string = null;
    intentId: Number = null;
    memo: string = null;
    did: string = null;
    nickname: string = null;
    url: string = null;
    crPublicKey: string = null;
    account: string = null;
    rawTransaction: string = null;
    payPassword: string = null;
    location: number = null;
    crDID: string = null;
    from: string = null;
    fee: number = 0;
    chainId: CoinName = null;
    votes: any; // TODO
    invalidCandidates: any; // TODO
    amount: number = 0;
    publickey: string;
    toAddress: string = 'default';
    publicKeys: any;
    didrequest: string;
    type: string = 'payment-confirm';
    sideChainId: string;
}

@Injectable({
    providedIn: 'root'
})
export class CoinTransferService {
    // Below fields are shared by several screens operating fund transfers between subwallets.
    // Consider this service as a singleton shared class.
    public transfer: Transfer; // TODO: messy class that embeds too many unrelated things... Split into specific transfer types.
    public walletInfo: WalletAccount;
    
    constructor() {
        this.reset();
    }

    /**
     * Resets all service fields to their default value to restart a new transfer.
     */
    public reset() {
        this.transfer = new Transfer();
        this.walletInfo = new WalletAccount();
    }
}
