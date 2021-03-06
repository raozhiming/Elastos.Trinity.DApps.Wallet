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
import { StandardCoinName, CoinType } from '../model/Coin';
import { WalletID } from '../model/wallets/MasterWallet';
import { SPVWalletPluginBridge, SPVWalletMessage, ETHSCEventType, ETHSCEvent, ETHSCEventAction } from '../model/SPVWalletPluginBridge';
import { Native } from './native.service';
import { PopupProvider } from './popup.service';
import { WalletManager } from './wallet.service';
import { LocalStorage } from './storage.service';
import { TranslateService } from '@ngx-translate/core';
import { Events } from './events.service';

declare let appManager: AppManagerPlugin.AppManager;
declare let notificationManager: NotificationManagerPlugin.NotificationManager;

export type InAppRPCMessage = {
    method: RPCMethod;
    params: any;
    startupMode: string;
};

export enum RPCMethod {
    START_WALLET_SYNC,
    STOP_WALLET_SYNC,
    GET_WALLET_SYNC_PROGRESS,
    SEND_WALLET_SYNC_PROGRESS,
    UPDAET_MASTER_WALLET,
    STOP_WALLET_SYNC_RESPONSE
}

export type RPCStartWalletSyncParams = {
    masterId: WalletID;
    chainIds: StandardCoinName[]
};

export type RPCStopWalletSyncParams = RPCStartWalletSyncParams;

export type RPCStopWalletSyncResponseParams = {
    masterId: WalletID;
    chainIds: StandardCoinName[];
    success: boolean; // Whether the sync could successfully be stopped or not
}

export type ChainSyncProgress = {
  progress: number;
  lastBlockTime: number
};

export type WalletSyncProgress = {
  [index: string]: ChainSyncProgress
};

export interface RPCUpdateWalletInfoParams {
    masterId: WalletID;
    action: string;
}

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

    public walletsSyncProgress: {
      [index: string]: WalletSyncProgress
    } = {};

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

        await this.walletManager.startSyncAllWallet();
    }

    /**
     * Handler for all SPV wallet events received by the background service.
     */
    private handleSubWalletEvent(event: SPVWalletMessage) {
        const masterId = event.MasterWalletID;
        const chainId = event.ChainID;

        console.log("SubWallet message: ", masterId, chainId, event);
        // console.log(event.Action, event.result);

        switch (event.Action) {
            case 'OnBlockSyncProgress':
                this.handleBlockSyncProgressEvent(masterId, chainId, event);
                break;
            case 'OnBalanceChanged':
                // Nothing to do for now
                break;
            case 'OnETHSCEventHandled':
                this.handleETHSCBlockSyncProgressEvent(masterId, chainId, event);
                break;
        }
    }

    public async syncStartSubWallets(masterId: WalletID, chainIds: StandardCoinName[]): Promise<void> {
        console.log("SubWallets sync is starting:", masterId);

        for (const chainId of chainIds) {
            await this.spvBridge.syncStart(masterId, chainId);
        }

        console.log("SubWallet sync start is completed");
    }

    public async syncStopSubWallets(masterId: WalletID, chainIds: StandardCoinName[]): Promise<boolean> {
        console.log("SubWallets sync is stopping:", masterId);

        for (const chainId of chainIds) {
            try {
                await this.spvBridge.syncStop(masterId, chainId);
            }
            catch (e) {
                console.error("Failed to stop subwallet "+chainId+" of master wallet "+masterId+"! Reason:", e, JSON.stringify(e));
                return false;
            }
        }

        console.log("SubWallet sync stop is completed");
        return true;
    }

    private async handleAppManagerMessage(message: AppManagerPlugin.ReceivedMessage) {
        if (!message || !message.message) {
            return;
        }

        const rpcMessage = JSON.parse(message.message) as InAppRPCMessage;
        switch (rpcMessage.method) {
            case RPCMethod.GET_WALLET_SYNC_PROGRESS:
                // TODO: upgraded spvsdk -- Get sync progress by api when it doesn't connect to node.
                const sendRPCMessage: InAppRPCMessage = {
                  method: RPCMethod.SEND_WALLET_SYNC_PROGRESS,
                  params: this.walletsSyncProgress,
                  startupMode: 'service'
                };

                let appId = "org.elastos.trinity.dapp.wallet";
                if (rpcMessage.startupMode === 'intent') { // from intent
                  appId += '#intent';
                }

                appManager.sendMessage(appId, AppManagerPlugin.MessageType.INTERNAL, JSON.stringify(sendRPCMessage), ()=>{
                  // Nothing to do
                }, (err) => {
                    console.log("Failed to send start RPC message to the sync service", err);
                });
                break;
            case RPCMethod.START_WALLET_SYNC:
                const startWalletSyncParams = rpcMessage.params as RPCStartWalletSyncParams;
                await this.syncStartSubWallets(startWalletSyncParams.masterId, startWalletSyncParams.chainIds);
                break;
            case RPCMethod.STOP_WALLET_SYNC:
                const stopWalletSyncParams = rpcMessage.params as RPCStopWalletSyncParams;
                let success: boolean = false;
                try {
                    success = await this.syncStopSubWallets(stopWalletSyncParams.masterId, stopWalletSyncParams.chainIds);
                }
                catch (e) {
                    console.error("Stop wallet sync error:", e);
                    success = false;
                }
                console.log("All subwallets stopped in spvsync service. Now sending response to the app side.");

                const responseParams: RPCStopWalletSyncResponseParams = {
                    masterId: stopWalletSyncParams.masterId,
                    chainIds: stopWalletSyncParams.chainIds,
                    success: success
                };

                const responseMessage: InAppRPCMessage = {
                    method: RPCMethod.STOP_WALLET_SYNC_RESPONSE,
                    params: responseParams,
                    startupMode: 'service'
                };

                // Send message to the app (default)
                appManager.sendMessage("org.elastos.trinity.dapp.wallet", AppManagerPlugin.MessageType.INTERNAL, JSON.stringify(responseMessage), ()=>{
                    // Nothing to do
                }, (err) => {
                    console.log("Failed to send sync stop response to wallet - app not running", err);
                });

                break;
            case RPCMethod.UPDAET_MASTER_WALLET:
                const updateWalletInfoParams = rpcMessage.params as RPCUpdateWalletInfoParams;
                this.walletManager.updateMasterWallets(updateWalletInfoParams.masterId, updateWalletInfoParams.action);
                break;
            default:
                break;
        }
    }

    private async handleBlockSyncProgressEvent(masterId: WalletID, chainId: StandardCoinName, event: SPVWalletMessage) {
        if (!this.walletManager.masterWallets[masterId]) {
            return;
        }
        this.walletManager.masterWallets[masterId].updateSyncProgress(chainId, event.Progress, event.LastBlockTime);

        if (!this.walletsSyncProgress[masterId]) {
            this.walletsSyncProgress[masterId] = {};
        }
        this.walletsSyncProgress[masterId][chainId] = {progress: event.Progress, lastBlockTime: event.LastBlockTime};

        // If we are reaching 100% sync and this is the first time we reach it, we show a notification
        // to the user.
        if (event.Progress === 100) {
            const notificationSent = await this.syncCompletedNotificationSent(chainId);
            if (!notificationSent) {
                await this.sendSyncCompletedNotification(chainId);
            }
        }
    }

    private async handleETHSCBlockSyncProgressEvent(masterId: WalletID, chainId: StandardCoinName, event: SPVWalletMessage) {
        // TODO: check more event
        if (event.event.Type !== ETHSCEventType.EWMEvent) {
            return;
        }

        if (!this.walletsSyncProgress[masterId]) {
            this.walletsSyncProgress[masterId] = {};
        }

        switch (event.event.Event) {
            case ETHSCEventAction.PROGRESS:
                this.walletsSyncProgress[masterId][chainId] = {progress: Math.round(event.event.PercentComplete), lastBlockTime: event.event.Timestamp};
                break;
            case ETHSCEventAction.CHANGED:
                if (('CONNECTED' === event.event.NewState) && ('CONNECTED' === event.event.OldState)) {
                    this.walletsSyncProgress[masterId][chainId] = {progress: 100, lastBlockTime: new Date().getTime() / 1000};
                }
                break;
            default:
                // Do nothing
                break;
        }
    }

    /**
     * Tells if the "sync completed" notification has already been sent earlier for a given chain id or not.
     */
    private async syncCompletedNotificationSent(chainId: StandardCoinName): Promise<boolean> {
        const notificationSent = await this.localStorage.get("sync-completed-notification-sent-"+chainId) || false;
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
