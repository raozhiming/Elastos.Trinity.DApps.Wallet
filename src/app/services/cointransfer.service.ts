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
import { StandardCoinName } from '../model/Coin';
import { WalletAccount } from '../model/WalletAccount';

export class Transfer {
    action: string = null;
    intentId: Number = null;
    memo: string = '';
    did: string = null;
    nickname: string = null;
    url: string = null;
    crPublicKey: string = null;
    account: string = null;
    rawTransaction: any = null;
    location: number = null;
    crDID: string = null;
    from: string = null;
    fee: number = 0;
    chainId: StandardCoinName = null;
    votes: any; // TODO
    amount: number;
    publickey: string;
    toAddress: string = '';
    publicKeys: any;
    didrequest: string;
    type: string = 'payment-confirm';
    sideChainId: string;
    currency: string; // pay
    rate: number;
    payPassword: string;
}

export enum TransferType {
    RECHARGE = 1,
    SEND = 2
}

@Injectable({
    providedIn: 'root'
})

export class CoinTransferService {

    // Define transfer type
    public transferType: TransferType;
    // From subwallet
    public chainId: StandardCoinName;
    // To subwallet (only for recharging funds)
    public subchainId: string;
    // Unsure of what this is used for
    public walletInfo: WalletAccount;

    // Deprecated for receiving, sending and recharging funds but kept incase intents use it
    public transfer: any = null;

    constructor() {
        this.reset();
    }

    /**
     * Resets all service fields to their default value to restart a new transfer.
     */
    public reset() {
        // Deprecated for receiving, sending and recharging funda
        this.transfer = new Transfer();

        this.transferType = null;
        this.chainId = null;
        this.subchainId = null;
        this.walletInfo = new WalletAccount();
    }
}
