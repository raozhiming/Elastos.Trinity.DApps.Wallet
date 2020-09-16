import { Injectable } from '@angular/core';
import { NetworkType } from '../model/NetworkType';

declare let appManager: AppManagerPlugin.AppManager;

@Injectable({
    providedIn: 'root'
})
export class PrefsService {
    constructor() {
    }

    /**
     * Returns the currently active network such as mainnet or testnet.
     * Retrieved from elastOS' global preferences.
     */
    public getActiveNetworkType(): Promise<NetworkType> {
        return new Promise((resolve)=>{
            appManager.getPreference("chain.network.type", (value)=>{
                resolve(value as NetworkType);
            });
        });
    }
}
