import { Events } from '@ionic/angular';
import { Native } from './native.service';
import { WalletManager } from './wallet.service';
import { Injectable } from '@angular/core';

declare let appManager: AppManagerPlugin.AppManager;

@Injectable({
    providedIn: 'root'
})
export class NavService {
    constructor(public events: Events, public native: Native, private walletManager: WalletManager) {
    }

    public showStartupScreen() {
        console.log("Computing and showing startup screen");

        appManager.hasPendingIntent(async (hasPendingIntent) => {
            if (hasPendingIntent) {
                // There is a pending intent: directly show the intent screen
                console.log("There is a pending intent");
            }
            else {
                // No pending intent - show the appropriate startup screen
                console.log("There is no pending intent - showing home screen");

                if (this.walletManager.activeMasterWallet) {
                    // Go to wallet's home page.
                    this.native.setRootRouter("/wallet-home");
                }
                else {
                    this.native.setRootRouter("/launcher");
                }
            }
        });
    }
}
