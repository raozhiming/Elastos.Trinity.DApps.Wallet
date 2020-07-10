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
import { StandardCoinName } from '../model/Coin';
import { Events } from '@ionic/angular';
import { WalletID } from '../model/MasterWallet';
import { SPVWalletPluginBridge } from '../model/SPVWalletPluginBridge';

declare let appManager: AppManagerPlugin.AppManager;

export type InAppRPCMessage = {
    method: RPCMethod;
    params: any;
}

export enum RPCMethod {
    START_WALLET_SYNC,
    STOP_WALLET_SYNC
}

export type RPCStartWalletSyncParams = {
    masterId: WalletID;
    chainIds: StandardCoinName[]
}

export type RPCStopWalletSyncParams = RPCStartWalletSyncParams;

@Injectable({
    providedIn: 'root'
})
/**
 * Service responsible for managing sync status for SPV wallets. It can be initiated from a elastOS
 * background service context or directly from the application, depending on users preferences.
 * By default, it runs in the background service.
 */
export class SPVSyncService {
    constructor(private events: Events, private spvBridge: SPVWalletPluginBridge) {
    }

    public initialize() {
        appManager.setListener((message)=>{
            this.handleAppManagerMessage(message);
        });
    }

    private async syncStartSubWallets(masterId: WalletID, chainIds: StandardCoinName[]) {
        console.log("SubWallets sync is starting");

        for (let chainId of chainIds) {
            // TODO this.spvBridge.registerWalletListener(TODO)

            this.spvBridge.syncStart(masterId, chainId);
        }
    }

    private syncStopSubWallets(masterId: WalletID, chainIds: StandardCoinName[]) {
        console.log("SubWallets sync is stopping");

        for (let chainId of chainIds) {
            // TODO this.spvBridge.removeWalletListener(TODO);

            this.spvBridge.syncStop(masterId, chainId);
        }
    }

    private handleAppManagerMessage(message: AppManagerPlugin.ReceivedMessage) {
        if (!message || !message.message)
            return;

        let rpcMessage = JSON.parse(message.message) as InAppRPCMessage;
        switch (rpcMessage.method) {
            case RPCMethod.START_WALLET_SYNC:
                let startWalletSyncParams = rpcMessage.params as RPCStartWalletSyncParams;
                this.syncStartSubWallets(startWalletSyncParams.masterId, startWalletSyncParams.chainIds);
                break;
            case RPCMethod.STOP_WALLET_SYNC:
                let stopWalletSyncParams = rpcMessage.params as RPCStopWalletSyncParams;
                this.syncStopSubWallets(stopWalletSyncParams.masterId, stopWalletSyncParams.chainIds);
                break;
            default:
                break;
        }
    }
}
