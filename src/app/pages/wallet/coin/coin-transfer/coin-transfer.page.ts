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
import { Events, PopoverController, ModalController } from '@ionic/angular';
import { AppService, ScanType } from '../../../../services/app.service';
import { Config } from '../../../../config/Config';
import { Native } from '../../../../services/native.service';
import { Util } from '../../../../model/Util';
import { WalletManager } from '../../../../services/wallet.service';
import { MasterWallet } from 'src/app/model/wallets/MasterWallet';
import { CoinTransferService, TransferType, Transfer } from 'src/app/services/cointransfer.service';
import { StandardCoinName } from 'src/app/model/Coin';
import { ThemeService } from 'src/app/services/theme.service';
import { SubWallet } from 'src/app/model/wallets/SubWallet';
import * as CryptoAddressResolvers from 'src/app/model/address-resolvers';
import { HttpClient } from '@angular/common/http';
import { TxConfirmComponent } from 'src/app/components/tx-confirm/tx-confirm.component';
import { TranslateService } from '@ngx-translate/core';
import { CurrencyService } from 'src/app/services/currency.service';
import { IntentService } from 'src/app/services/intent.service';
import { UiService } from 'src/app/services/ui.service';
import { StandardSubWallet } from 'src/app/model/wallets/StandardSubWallet';
import BigNumber from 'bignumber.js';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { TxSuccessComponent } from 'src/app/components/tx-success/tx-success.component';
import { ContactsService } from 'src/app/services/contacts.service';
import { ContactsComponent } from 'src/app/components/contacts/contacts.component';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;
declare let appManager: AppManagerPlugin.AppManager;
export let popover: any = null;

@Component({
    selector: 'app-coin-transfer',
    templateUrl: './coin-transfer.page.html',
    styleUrls: ['./coin-transfer.page.scss'],
    providers: [Keyboard],
})
export class CoinTransferPage implements OnInit, OnDestroy {

    public masterWallet: MasterWallet;
    private syncCompletionEventName: string = null;
    public waitingForSyncCompletion = false;

    // Define transfer type
    public transferType: TransferType;
    public chainId: string;

    // User inputs
    public toAddress: string;
    public amount: number; // Here we can use JS "number" type, for now we consider we will never transfer a number that is larger than JS's MAX INT.
    public memo = '';

    // Display recharge wallets
    public fromSubWallet: SubWallet;
    public toSubWallet: SubWallet;

    // Display memo
    public hideMemo = true;

    // Submit transaction
    public transaction: any;

    // CryptoName
    cryptoNameSelected = false;
    cryptoName: string = null;

    // Helpers
    public Config = Config;
    private SELA = Config.SELA;

    // Titlebar
    private onItemClickedListener: any;

    // Addresses resolved from typed user friendly names (ex: user types "rong" -> resolved to rong's ela address)
    public suggestedAddresses: CryptoAddressResolvers.Address[] = [];

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
        private translate: TranslateService,
        private popoverCtrl: PopoverController,
        public currencyService: CurrencyService,
        private intentService: IntentService,
        public uiService: UiService,
        public keyboard: Keyboard,
        private contactsService: ContactsService,
        private modalCtrl: ModalController
    ) {
    }

    ngOnInit() {
        this.init();
        this.events.subscribe('address:update', (address) => {
            this.zone.run(() => {
                this.toAddress = address;
            });
        });
        titleBarManager.addOnItemClickedListener(this.onItemClickedListener = (menuIcon: TitleBarPlugin.TitleBarIcon) => {
            if (menuIcon.key === "contacts") {
                this.showContacts();
            }
        });
    }

    ionViewWillEnter() {
        appManager.setVisible("show");
    }

    ionViewWillLeave() {
        this.setContactKeyVisibility(false);
    }

    ngOnDestroy() {
        this.events.unsubscribe('address:update');
        this.events.unsubscribe('intent:pay');

        if (this.syncCompletionEventName)
            this.events.unsubscribe(this.syncCompletionEventName);
    }

    setContactKeyVisibility(showContactKey: boolean) {
        if (showContactKey) {
            titleBarManager.setIcon(TitleBarPlugin.TitleBarIconSlot.OUTER_RIGHT, {
                key: "contacts",
                iconPath: TitleBarPlugin.BuiltInIcon.ADD
            });
        } else {
            titleBarManager.setIcon(TitleBarPlugin.TitleBarIconSlot.OUTER_RIGHT, null);
        }
    }

    async init() {
        this.masterWallet = this.walletManager.getMasterWallet(this.coinTransferService.masterWalletId);
        this.transferType = this.coinTransferService.transferType;
        this.chainId = this.coinTransferService.chainId;
        this.waitingForSyncCompletion = false;

        this.fromSubWallet = this.masterWallet.getSubWallet(this.chainId);

        console.log('Balance', this.masterWallet.subWallets[this.chainId].getDisplayBalance());

        switch (this.transferType) {
            // For Recharge Transfer
            case TransferType.RECHARGE:
                // Setup page display
                this.appService.setTitleBarTitle(this.translate.instant("coin-transfer-recharge-title", {coinName: this.coinTransferService.subchainId}));
                this.toSubWallet = this.masterWallet.getSubWallet(this.coinTransferService.subchainId);

                // Setup params for recharge transaction
                this.transaction = this.createRechargeTransaction;
                this.toAddress = await this.toSubWallet.createAddress();

                // Auto suggest a transfer amount of 0.1 ELA (enough) to the ID chain. Otherwise, let user define his own amount.
                if (this.toSubWallet.id === StandardCoinName.IDChain) {
                    this.amount = 0.1;
                }

                console.log('Transferring from..', this.fromSubWallet);
                console.log('Transferring To..', this.toSubWallet);
                console.log('Subwallet address', this.toAddress);
                break;
            case TransferType.WITHDRAW:
                // Setup page display
                this.appService.setTitleBarTitle(this.translate.instant("coin-transfer-withdraw-title", {coinName: this.chainId}));
                this.toSubWallet = this.masterWallet.getSubWallet(StandardCoinName.ELA);

                // Setup params for withdraw transaction
                this.transaction = this.createWithdrawTransaction;
                this.toAddress = await this.toSubWallet.createAddress();

                console.log('Transferring from..', this.fromSubWallet);
                console.log('Transferring To..', this.toSubWallet);
                console.log('Subwallet address', this.toAddress);
                break;
            // For Send Transfer
            case TransferType.SEND:
                this.appService.setTitleBarTitle(this.translate.instant("coin-transfer-send-title", {coinName: this.chainId}));
                this.transaction = this.createSendTransaction;

                if (this.chainId === StandardCoinName.ELA && this.contactsService.contacts.length) {
                    this.setContactKeyVisibility(true);
                }

                break;
            // For Pay Intent
            case TransferType.PAY:
                this.appService.setTitleBarTitle(this.translate.instant("payment-title"));
                this.transaction = this.createSendTransaction;

                console.log('Pay intent params', this.coinTransferService.payTransfer);
                this.toAddress = this.coinTransferService.payTransfer.toAddress;
                this.amount = this.coinTransferService.payTransfer.amount;
                this.memo = this.coinTransferService.payTransfer.memo;
                break;
        }

        // In case the subwallet is not fully synced we wait for the sync completion
        // Before allowing to transfer, to make sure the transfer will not be lost, as even if this is queued
        // by the SPVSDK, it's not persistant in case of restart.
        if (this.masterWallet.subWallets[this.fromSubWallet.id].progress !== 100) {
            this.waitingForSyncCompletion = true;
            this.syncCompletionEventName = this.masterWallet.id + ':' + this.fromSubWallet.id + ':synccompleted';
            this.events.subscribe(this.syncCompletionEventName, (coin) => {
                this.zone.run(() => {
                    this.waitingForSyncCompletion = false;
                    this.amount = 0.1;
                });
                this.events.unsubscribe(this.syncCompletionEventName);
            });
        }
    }

    /**
     * Same chain, different "users"
     */
    async createSendTransaction() {
        let toAmount: number;
        if ((this.chainId === StandardCoinName.ELA) || (this.chainId === StandardCoinName.IDChain)) {
            toAmount = this.accMul(this.amount, Config.SELA);
        } else {
            toAmount = this.amount;
        }

        // Call dedicated api to the source subwallet to generate the appropriate transaction type.
        // For example, ERC20 token transactions are different from standard coin transactions (for now - as
        // the spv sdk doesn't support ERC20 yet).
        let rawTx = await this.fromSubWallet.createPaymentTransaction(
            this.toAddress, // User input address
            toAmount.toString(), // User input amount
            this.memo // User input memo
        );

        let transfer = new Transfer();
        Object.assign(transfer, {
            masterWalletId: this.masterWallet.id,
            chainId: this.chainId,
            rawTransaction: rawTx,
            action: this.transferType === TransferType.PAY ? this.coinTransferService.intentTransfer.action : null ,
            intentId: this.transferType === TransferType.PAY ? this.coinTransferService.intentTransfer.intentId : null ,
        });

        await this.fromSubWallet.signAndSendRawTransaction(rawTx, transfer);
        this.showSuccess();
    }

    /**
     * From mainchain to sidechains (ID, ETH)
     */
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

        const transfer = new Transfer();
        Object.assign(transfer, {
            masterWalletId: this.masterWallet.id,
            chainId: this.chainId,
            rawTransaction: rawTx,
            payPassword: '',
            action: null,
            intentId: null,
        });

        await this.fromSubWallet.signAndSendRawTransaction(rawTx, transfer);
        this.showSuccess();
    }

    /**
     * From sidechain (ID, ETH) to mainchain
     */
    async createWithdrawTransaction() {
        let toAmount: number;
        if ((this.chainId === StandardCoinName.ELA) || (this.chainId === StandardCoinName.IDChain)) {
            toAmount = this.accMul(this.amount, Config.SELA);
        } else {
            toAmount = this.amount;
        }

        const rawTx = await this.fromSubWallet.createWithdrawTransaction(
            this.toAddress,
            toAmount,
            this.memo
        );

        const transfer = new Transfer();
        Object.assign(transfer, {
            masterWalletId: this.masterWallet.id,
            chainId: this.chainId,
            rawTransaction: rawTx,
            payPassword: '',
            action: null,
            intentId: null,
        });

        await this.fromSubWallet.signAndSendRawTransaction(rawTx, transfer);
        this.showSuccess();
    }

    goScan() {
        this.appService.scan(ScanType.Address);
    }

    goTransaction() {
        // this.showConfirm();
        // this.showSuccess();
        this.checkValue();
    }

    async checkValue() {
        if (Util.isNull(this.amount)) {
            this.native.toast_trans('amount-null');
            return;
        }
        if (!Util.number(this.amount)) {
            this.native.toast_trans('amount-invalid');
            return;
        }
        if (this.amount <= 0) {
            this.native.toast_trans('amount-invalid');
            return;
        }
        if (!this.masterWallet.subWallets[this.chainId].isBalanceEnough(new BigNumber(this.amount))) {
            this.native.toast_trans('insuff-balance');
            return;
        }
        // TODO: not 8, should use tokenDecimals for ETHSC and ERC20 Token
        if (this.amount.toString().indexOf('.') > -1 && this.amount.toString().split(".")[1].length > 8) {
            this.native.toast_trans('amount-invalid');
            return;
        }
        try {
            let isAddressValid = await this.walletManager.spvBridge.isAddressValid(
                this.masterWallet.id,
                this.toAddress
            );

            if (!isAddressValid) {
                this.native.toast_trans('correct-address');
                return;
            }

            if (this.transferType === TransferType.PAY) {
                this.transaction();
            } else {
                this.showConfirm();
            }
        } catch (error) {
            this.native.toast_trans('contact-address-digits');
        }
    }

    async showConfirm() {
        this.uiService.showPopover = true;
        const txInfo = {
            type: this.transferType,
            transferFrom: this.chainId,
            transferTo: this.transferType === TransferType.RECHARGE ? this.coinTransferService.subchainId : this.toAddress,
            amount: this.amount,
            memo: this.memo ? this.memo : null,
        };

        popover = await this.popoverCtrl.create({
            mode: 'ios',
            cssClass: 'txPopup',
            component: TxConfirmComponent,
            componentProps: {
                txInfo: txInfo
            }
        });
        popover.onWillDismiss().then((params) => {
            this.uiService.showPopover = false;
            popover = null;
            console.log('Confirm tx params', params);
            if (params.data && params.data.confirm) {
                this.transaction();
            }
        });
        return await popover.present();
    }


    async showSuccess() {
        this.uiService.showPopover = true;
        popover = await this.popoverCtrl.create({
            mode: 'ios',
            cssClass: 'txPopup',
            component: TxSuccessComponent,
        });
        popover.onWillDismiss().then(() => {
            this.uiService.showPopover = false;
            popover = null;
        });
        return await popover.present();
    }

    // Pay intent
    async cancelPayment() {
        await this.intentService.sendIntentResponse(
            this.coinTransferService.intentTransfer.action,
            { txid: null },
            this.coinTransferService.intentTransfer.intentId
        );
        this.appService.close();
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
        this.cryptoName = null;

        if (!enteredText) {
            return;
        }

        // Quick and dirty way to not try to resolve a name when it's actually an address already, not name.
        // Could be improved later.
        if (enteredText.length > 20)
            return;

        // Cryptoname
        if (enteredText.length >= 3) {
            // For now, handle only ELA addresses for cryptoname
            if (this.chainId !== StandardCoinName.ELA)
                return;

            let cryptoNameResolver = new CryptoAddressResolvers.CryptoNameResolver(this.http);
            let results = await cryptoNameResolver.resolve(enteredText, StandardCoinName.ELA);
            console.log("cryptoname results", results);

            this.suggestedAddresses = this.suggestedAddresses.concat(results);
        }
    }

    /**
     * A suggested resolved address is picked by the user. Replace user's input (ex: the user friendly name)
     * with its real address.
     */
    selectSuggestedAddress(suggestedAddress: CryptoAddressResolvers.CryptoNameAddress) {
        this.toAddress = suggestedAddress.address;
        this.cryptoName = suggestedAddress.getDisplayName();

        // Hide/reset suggestions
        this.suggestedAddresses = [];

        let targetContact = this.contactsService.contacts.find((contact) => contact.address === suggestedAddress.address);
        if (!targetContact) {
            this.contactsService.contacts.push({
                cryptoname:  this.cryptoName,
                address: this.toAddress
            });

            this.contactsService.setContacts();
        }

        this.setContactKeyVisibility(true);
    }

    isStandardSubwallet(subWallet: SubWallet) {
        return subWallet instanceof StandardSubWallet;
    }

    convertAmountToBigNumber(amount: number) {
        return new BigNumber(amount);
    }

    async showContacts() {
        this.appService.setBackKeyVisibility(false);
        this.setContactKeyVisibility(false);
        this.appService.setTitleBarTitle('select-address');

        const modal = await this.modalCtrl.create({
            component: ContactsComponent,
            componentProps: {
            },
        });
        modal.onWillDismiss().then((params) => {
            console.log('Contact selected', params);
            if (params.data && params.data.contact) {
                this.cryptoName = params.data.contact.cryptoname;
                this.toAddress = params.data.contact.address;
            }

            this.appService.setBackKeyVisibility(true);
            this.appService.setTitleBarTitle(this.translate.instant("coin-transfer-send-title", {coinName: this.chainId}));
            this.setContactKeyVisibility(true);
        });
        modal.present();
    }
}
