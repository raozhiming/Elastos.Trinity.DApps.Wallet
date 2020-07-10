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

        appManager.hasPendingIntent(async (hasPendingIntent)=>{
            if (hasPendingIntent) {
                // There is a pending intent: directly show the intent screen
                console.log("There is a pending intent");
            }
            else {
                // No pending intent - show the appropriate startup screen
                console.log("There is no pending intent - showing home screen");

                if (Object.values(this.walletManager.masterWallets).length > 0) {
                    let storedMasterId = await this.walletManager.getCurrentMasterIdFromStorage()

                    // Wrong master id or something desynchronized. use the first wallet in the list as default
                    if (!storedMasterId || !(storedMasterId in this.walletManager.masterWallets)) {
                        console.warn("Invalid master ID retrieved from storage. Using the first wallet as default");
                        storedMasterId = Object.values(this.walletManager.masterWallets)[0].id;
                    }

                    await this.walletManager.setActiveMasterWalletId(storedMasterId);
                }
                else {
                    this.native.setRootRouter("/launcher");
                }
            }
        })
    }
}
