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

import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events, PopoverController } from '@ionic/angular';
import { AppService, ScanType } from '../../../../services/app.service';
import { Config } from '../../../../config/Config';
import { Native } from '../../../../services/native.service';
import { Util } from '../../../../model/Util';
import { WalletManager } from '../../../../services/wallet.service';
import { MasterWallet } from 'src/app/model/MasterWallet';
import { CoinTransferService, TransferType } from 'src/app/services/cointransfer.service';
import { StandardCoinName, StandardCoin } from 'src/app/model/Coin';
import { ThemeService } from 'src/app/services/theme.service';
import { SubWallet } from 'src/app/model/SubWallet';
import * as CryptoAddressResolvers from 'src/app/model/address-resolvers';
import { HttpClient } from '@angular/common/http';
import { CryptoNameAddress } from 'src/app/model/address-resolvers';
import { WalletAccount } from 'src/app/model/WalletAccount';
import { TxConfirmComponent } from 'src/app/components/tx-confirm/tx-confirm.component';
import { NumberFormatStyle } from '@angular/common';

declare let appManager: AppManagerPlugin.AppManager;
export let popover: any = null;

export type Transfer = {
    masterWalletId: string,
    chainId: string,
    rawTransaction: any,
    payPassword: string,
    action: any,
    intentId: number,
};

@Component({
    selector: 'app-coin-transfer',
    templateUrl: './coin-transfer.page.html',
    styleUrls: ['./coin-transfer.page.scss'],
})
export class CoinTransferPage implements OnInit, OnDestroy {

    private masterWallet: MasterWallet;
    private walletInfo: WalletAccount;

    // Define transfer type
    public transferType: TransferType;
    public chainId: string;

    // User inputs
    public toAddress: string;
    public amount: number;
    public memo: string = '';

    // Display recharge wallets
    public fromSubWallet: SubWallet;
    public toSubWallet: SubWallet;

    // Display memo
    public hideMemo: boolean = true;

    // Submit transaction
    public transaction: any;

    // Helpers
    public Config = Config;
    public SELA = Config.SELA;

    // Display confirm popup
    public showPopover = popover;

    // Addresses resolved from typed user friendly names (ex: user types "rong" -> resolved to rong's ela address)
    suggestedAddresses: CryptoAddressResolvers.Address[] = [];

    constructor(
        public route: ActivatedRoute,
        public walletManager: WalletManager,
        public appService: AppService,
        public coinTransferService: CoinTransferService,
        public native: Native,
        public events: Events,
        public zone: NgZone,
        private http: HttpClient,
        public theme: ThemeService,
        private popoverCtrl: PopoverController
    ) {
    }

    ngOnInit() {
        this.init();
        this.events.subscribe('address:update', (address) => {
            this.zone.run(() => {
                this.toAddress = address;
            });
        });
    }

    ionViewWillEnter() {
        appManager.setVisible("show");
    }

    ionViewWillLeave() {
    }

    ngOnDestroy() {
        this.events.unsubscribe('address:update');
    }

    init() {
        this.masterWallet = this.walletManager.getActiveMasterWallet();
        this.transferType = this.coinTransferService.transferType;
        this.chainId = this.coinTransferService.chainId;

        // For Recharge Transfer
        if (this.coinTransferService.transferType === 1) {

            // Setup page display
            this.appService.setTitleBarTitle('Transfer ' + this.chainId);
            this.fromSubWallet = this.walletManager.activeMasterWallet.getSubWallet(this.chainId);
            this.toSubWallet = this.walletManager.activeMasterWallet.getSubWallet(this.coinTransferService.subchainId);

            // Setup params for recharge transaction
            this.transaction = this.createRechargeTransaction;
            this.getSubwalletAddress(this.coinTransferService.subchainId);
            this.amount = 0.1;

            console.log('Transferring from..', this.fromSubWallet);
            console.log('Transferring To..', this.toSubWallet);
            console.log('Subwallet address', this.toAddress);

        // For Send Transfer
        } else {
            this.appService.setTitleBarTitle('Send ' + this.chainId);
            this.transaction = this.createSendTransaction;
        }
    }

    async getSubwalletAddress(chainId: string) {
        this.toAddress = await this.walletManager.spvBridge.createAddress(
            this.masterWallet.id,
            chainId
        );
    }

    async createSendTransaction() {
        const toAmount = this.accMul(this.amount, Config.SELA);

        const rawTx =
            await this.walletManager.spvBridge.createTransaction(
                this.masterWallet.id,
                this.chainId, // From subwallet id
                '', // From address, not necessary
                this.toAddress, // User input address
                toAmount.toString(), // User input amount
                this.memo // User input memo
            );

        const transfer: Transfer = {
            masterWalletId: this.masterWallet.id,
            chainId: this.chainId,
            rawTransaction: rawTx,
            payPassword: '',
            action: null,
            intentId: null,
        };

        console.log('Received raw transaction', rawTx);
        this.walletManager.openPayModal(transfer);
    }

    async createRechargeTransaction() {
        const toAmount = this.accMul(this.amount, Config.SELA);

        const rawTx =
            await this.walletManager.spvBridge.createDepositTransaction(
                this.masterWallet.id,
                this.chainId, // From subwallet id
                '', // From address, not necessary
                this.coinTransferService.subchainId, // To subwallet id
                toAmount.toString(), // User input amount
                this.toAddress, // Generated address
                this.memo // Memo, not necessary
            );

        const transfer: Transfer = {
            masterWalletId: this.masterWallet.id,
            chainId: this.chainId,
            rawTransaction: rawTx,
            payPassword: '',
            action: null,
            intentId: null,
        };

        console.log('Received raw transaction', rawTx);
        this.walletManager.openPayModal(transfer);
    }

/*     async createWithdrawTransaction() {
        const toAmount = this.accMul(this.transfer.amount, Config.SELA);

        this.transfer.rawTransaction =
            await this.walletManager.spvBridge.createWithdrawTransaction(
                this.masterWallet.id,
                this.chainId,
                '',
                toAmount.toString(),
                this.transfer.toAddress,
                this.transfer.memo
            );

        this.walletManager.openPayModal(this.transfer);
    } */

    goScan() {
        this.appService.scan(ScanType.Address);
    }

    goTransaction() {
        // this.showConfirm();
        this.checkValue();
    }

    async checkValue() {
        if (Util.isNull(this.toAddress)) {
            this.native.toast_trans('correct-address');
            return;
        }
        if (Util.isNull(this.amount)) {
            this.native.toast_trans('amount-null');
            return;
        }
        if (!Util.number(this.amount)) {
            this.native.toast_trans('correct-amount');
            return;
        }
        if (this.amount <= 0) {
            this.native.toast_trans('correct-amount');
            return;
        }
        if (this.amount * this.SELA > this.walletManager.activeMasterWallet.subWallets[this.chainId].balance) {
            this.native.toast_trans('error-amount');
            return;
        }
        if (this.amount.toString().indexOf('.') > -1 && this.amount.toString().split(".")[1].length > 8) {
            this.native.toast_trans('correct-amount');
            return;
        }
        try {
            await this.walletManager.spvBridge.isAddressValid(
                this.masterWallet.id,
                this.toAddress
            );
            this.showConfirm();
        } catch (error) {
            this.native.toast_trans('contact-address-digits');
        }
    }

    async showConfirm() {
        this.showPopover = true;
        let txInfo = {
            type: this.transferType,
            transferFrom: this.chainId,
            transferTo: this.transferType === 1 ? this.coinTransferService.subchainId : this.toAddress,
            amount: this.amount
        };

        popover = await this.popoverCtrl.create({
            mode: 'ios',
            cssClass: !this.theme.darkMode ? 'txConfirm' : 'txConfirmDark',
            component: TxConfirmComponent,
            componentProps: {
                txInfo: txInfo
            }
        });
        popover.onWillDismiss().then((params) => {
            this.showPopover = false;
            popover = null;
            console.log('Confirm tx params', params);
            if (params.data && params.data.confirm) {
                this.transaction();
            }
        });
        return await popover.present();
    }

    accMul(arg1, arg2) {
        let m = 0, s1 = arg1.toString(), s2 = arg2.toString();
        try { m += s1.split(".")[1].length } catch (e) { }
        try { m += s2.split(".")[1].length } catch (e) { }
        return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
    }

    /**
     * Callback called whenever the "send to" address changes.
     * At that time, we cantry to call some APIs to retrieve an address by
     */
    async onSendToAddressInput(enteredText: string) {
        this.suggestedAddresses = [];

        if (!enteredText)
            return;

        // Quick and dirty way to not try to resolve a name when it's actually an address already, not name.
        // Could be improved later.
        if (enteredText.length > 20) 
            return;
    
        // Cryptoname
        if (enteredText.length >= 3) {
            // For now, handle only ELA addresses for cryptoname
            if (this.chainId != StandardCoinName.ELA)
                return;

            let cryptoNameResolver = new CryptoAddressResolvers.CryptoNameResolver(this.http);
            let results = await cryptoNameResolver.resolve(enteredText, StandardCoinName.ELA);
            console.log("cryptoname results", results)

            this.suggestedAddresses = this.suggestedAddresses.concat(results);
        }
    }

    /**
     * A suggested resolved address is picked by the user. Replace user's input (ex: the user friendly name)
     * with its real address.
     */
    selectSuggestedAddress(suggestedAddress: CryptoAddressResolvers.CryptoNameAddress) {
        this.toAddress = suggestedAddress.address;

        // Hide/reset suggestions
        this.suggestedAddresses = [];
    }

    getCoinIcon(subWallet: SubWallet): string {
        switch (subWallet.id) {
            case StandardCoinName.ELA:
                return "assets/coins/ela-black.svg";
            case StandardCoinName.IDChain:
                return "assets/coins/ela-turquoise.svg";
            case StandardCoinName.ETHSC:
                return "assets/coins/ela-gray.svg";
            default:
                return "assets/coins/eth.svg";
        }
    }
}
