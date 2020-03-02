
import { Injectable } from '@angular/core';
import { LocalStorage } from './Localstorage';

declare let fingerprintManager: FingerprintPlugin.FingerprintManager;

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public static instance: AuthService = null;

    constructor(private storage: LocalStorage) {
        AuthService.instance = this;
    }

    /**
     * Activates fingerprint authentication instead of using a password.
     */
    async activateFingerprintAuthentication(walletID: string, password: string): Promise<boolean> {
        console.log('Activating fingerprint authentication for did store id ' + walletID);

        // Ask the fingerprint plugin to save user's password
        try {
            await fingerprintManager.authenticateAndSavePassword(walletID, password);
            // Password was securely saved. Now remember this user's choice in settings.
            await this.storage.set('useFingerprintAuthentication-' + walletID, true);
            return true;
        } catch (e) {
            console.log('authenticateAndSavePassword eror ', e);
            return false;
        }
    }

    async deactivateFingerprintAuthentication(walletID: string) {
        await this.storage.set('useFingerprintAuthentication-' + walletID, false);
    }

    async authenticateByFingerprintAndGetPassword(didStoreId: string) {
        // Ask the fingerprint plugin to authenticate and retrieve the password
        try {
            const password = await fingerprintManager.authenticateAndGetPassword(didStoreId);
            return password;
        } catch (e) {
            return null;
        }
    }

    async fingerprintAuthenticationEnabled(walletID: string): Promise<boolean> {
        return this.storage.get('useFingerprintAuthentication-' + walletID) || false;
    }

    async fingerprintIsAvailable() {
        try {
            let isAvailable = await fingerprintManager.isBiometricAuthenticationMethodAvailable();
            return isAvailable;
        } catch (e) {
            return false;
        }
    }
}
