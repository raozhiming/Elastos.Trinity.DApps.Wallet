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
import { SPVWalletPluginBridge, SPVWalletMessage } from '../model/SPVWalletPluginBridge';
import { Native } from './native.service';
import { PopupProvider } from './popup.service';
import { WalletManager } from './wallet.service';
import { LocalStorage } from './storage.service';
import { TranslateService } from '@ngx-translate/core';

declare let appManager: AppManagerPlugin.AppManager;
declare let notificationManager: NotificationManagerPlugin.NotificationManager;

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
    private spvBridge: SPVWalletPluginBridge;
    private walletManager: WalletManager;

    constructor(private native: Native, private events: Events, private popupProvider: PopupProvider,
        private localStorage: LocalStorage, private translate: TranslateService) {
        this.spvBridge = new SPVWalletPluginBridge(this.native, this.events, this.popupProvider);
    }

    public async init(walletManager: WalletManager) {
        console.log("SPV sync service is initializing");

        this.walletManager = walletManager;

        appManager.setListener((message)=>{
            this.handleAppManagerMessage(message);
        });

        this.spvBridge.registerWalletListener((event)=>{
            this.handleSubWalletEvent(event);
        });

        await this.startSyncingActiveWallet();
    }

    /**
     * Handler for all SPV wallet events received by the background service.
     */
    private handleSubWalletEvent(event: SPVWalletMessage) {
        let masterId = event.MasterWalletID;
        let chainId = event.ChainID;

        console.log("SubWallet message: ", masterId, chainId, event);
        //console.log(event.Action, event.result);

        switch (event.Action) {
            case "OnBlockSyncProgress":
                this.handleBlockSyncProgressEvent(masterId, chainId, event);
                break;
            case "OnBalanceChanged":
                // Nothing to do for now
                break;
        }
    }

    /**
     * Starts synchronization for the active subwallet saved in local storage, if any
     */
    private async startSyncingActiveWallet() {
        let storedMasterId = await this.walletManager.getCurrentMasterIdFromStorage()

        let activeWallet = this.walletManager.getMasterWallet(storedMasterId);
        if (!activeWallet) {
            console.log("No active wallet. Not starting any SPV sync");
        }
        else {
            this.walletManager.startWalletSync(activeWallet.id);
        }
    }

    private async syncStartSubWallets(masterId: WalletID, chainIds: StandardCoinName[]) {
        console.log("SubWallets sync is starting");

        for (let chainId of chainIds) {
            this.spvBridge.syncStart(masterId, chainId);
        }
    }

    private syncStopSubWallets(masterId: WalletID, chainIds: StandardCoinName[]) {
        console.log("SubWallets sync is stopping");

        for (let chainId of chainIds) {
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

    private async handleBlockSyncProgressEvent(masterId: WalletID, chainId: StandardCoinName, event: SPVWalletMessage) {
        // If we are reaching 100% sync and this is the first time we reach it, we show a notification
        // to the user.
        if (event.Progress == 100) {
            let notificationSent = await this.syncCompletedNotificationSent(chainId);
            if (!notificationSent) {
                await this.sendSyncCompletedNotification(chainId);
            }
        }
    }

    /**
     * Tells if the "sync completed" notification has already been sent earlier for a given chain id or not.
     */
    private async syncCompletedNotificationSent(chainId: StandardCoinName): Promise<boolean> {
        let notificationSent = await this.localStorage.get("sync-completed-notification-sent-"+chainId) || false;
        return notificationSent;
    }

    private async markSyncCompletedNotificationSent(chainId: StandardCoinName) {
        await this.localStorage.set("sync-completed-notification-sent-"+chainId, true);
    }

    /**
     * Sends a system notification inside elastOS when the wallet completes his synchronization for the first time.
     * This way, users know when they can start using their wallet in third party apps.
     */
    private async sendSyncCompletedNotification(chainId) {
        console.log('Sending sync completed notification for subwallet '+chainId);

        const request: NotificationManagerPlugin.NotificationRequest = {
            message: '',
            key: chainId + '-syncCompleted',
            title: chainId + ': ' + this.translate.instant('sync-completed'),
        };
        notificationManager.sendNotification(request);

        await this.markSyncCompletedNotificationSent(chainId);
      }
}
