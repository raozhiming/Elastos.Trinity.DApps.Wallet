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
import { CoinTransferService, Transfer } from 'src/app/services/cointransfer.service';
import { StandardCoinName, StandardCoin } from 'src/app/model/Coin';
import { ThemeService } from 'src/app/services/theme.service';
import { SubWallet } from 'src/app/model/SubWallet';
import * as CryptoAddressResolvers from 'src/app/model/address-resolvers';
import { HttpClient } from '@angular/common/http';
import { CryptoNameAddress } from 'src/app/model/address-resolvers';
import { WalletAccount } from 'src/app/model/WalletAccount';
import { TxConfirmComponent } from 'src/app/components/tx-confirm/tx-confirm.component';

declare let appManager: AppManagerPlugin.AppManager;
export let popover: any = null;

@Component({
    selector: 'app-coin-transfer',
    templateUrl: './coin-transfer.page.html',
    styleUrls: ['./coin-transfer.page.scss'],
})
export class CoinTransferPage implements OnInit, OnDestroy {

    private masterWallet: MasterWallet;
    private walletInfo: WalletAccount;
    public transfer: Transfer;
    public chainId: string;

    // Display recharge wallets
    public transferFrom: SubWallet;
    public transferTo: SubWallet;

    // Display memo
    public hideMemo: boolean = true;

    // Submit transaction
    public transFunction: any;

    // Helpers
    public Config = Config;
    public SELA = Config.SELA;

    public showPopover = popover;

    // Addresses resolved from typed user friendly names (ex: user types "rong" -> resolved to rong's ela address)
    suggestedAddresses: CryptoAddressResolvers.Address[] = [];

    constructor(
        public route: ActivatedRoute,
        public walletManager: WalletManager,
        public appService: AppService,
        private coinTransferService: CoinTransferService,
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
                this.transfer.toAddress = address;
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
        this.chainId = this.coinTransferService.transfer.chainId;
        this.walletInfo = this.coinTransferService.walletInfo;
        this.transfer = this.coinTransferService.transfer;
        this.masterWallet = this.walletManager.getActiveMasterWallet();

        if (this.coinTransferService.transfer.type === 'recharge') {
            this.appService.setTitleBarTitle('Transfer ' + this.chainId);
            this.transferFrom = this.walletManager.activeMasterWallet.getSubWallet(this.coinTransferService.transferFrom);
            this.transferTo = this.walletManager.activeMasterWallet.getSubWallet(this.coinTransferService.transferTo);
            console.log('Transferring from..', this.transferFrom);
            console.log('Transferring To..', this.transferTo);
        } else {
            this.appService.setTitleBarTitle('Send ' + this.chainId);
        }

        switch (this.transfer.type) {
            case 'transfer':
                this.transFunction = this.createTransaction;
                break;
            case 'recharge':
                this.transFunction = this.createDepositTransaction;
                this.transfer.rate = 1; // TODO: this is sidechain rate
                this.transfer.amount = 0.1; // for DID
                this.transfer.fee = 10000;
                this.chainId = 'ELA';
                this.getAddress(this.coinTransferService.transfer.sideChainId);
                break;
            case 'withdraw':
                this.transFunction = this.createWithdrawTransaction;
                this.transfer.rate = 1; // TODO:: this is mainchain rate
                this.getAddress('ELA');
                break;
        }
    }

    async getAddress(chainId: string) {
        this.transfer.toAddress = await this.walletManager.spvBridge.createAddress(
            this.masterWallet.id,
            chainId
        );
    }

    async createTransaction() {
        let toAmount = this.accMul(this.transfer.amount, Config.SELA);

        this.transfer.rawTransaction =
            await this.walletManager.spvBridge.createTransaction(
                this.masterWallet.id,
                this.chainId,
                '',
                this.transfer.toAddress,
                toAmount.toString(),
                this.transfer.memo
            );

        this.walletManager.openPayModal(this.transfer);
    }

    async createDepositTransaction() {
        const toAmount = this.accMul(this.transfer.amount, Config.SELA);

        this.transfer.rawTransaction =
            await this.walletManager.spvBridge.createDepositTransaction(
                this.masterWallet.id,
                'ELA',
                '',
                this.coinTransferService.transfer.sideChainId,
                toAmount.toString(), // user input amount
                this.transfer.toAddress, // user input address
                this.transfer.memo
            );

        this.walletManager.openPayModal(this.transfer);
    }

    async createWithdrawTransaction() {
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
    }

    goScan() {
        this.appService.scan(ScanType.Address);
    }

    goTransaction() {
        // this.showConfirm();
        this.checkValue();
    }

    async checkValue() {
        if (Util.isNull(this.transfer.toAddress)) {
            this.native.toast_trans('correct-address');
            return;
        }
        if (Util.isNull(this.transfer.amount)) {
            this.native.toast_trans('amount-null');
            return;
        }
        if (!Util.number(this.transfer.amount)) {
            this.native.toast_trans('correct-amount');
            return;
        }
        if (this.transfer.amount <= 0) {
            this.native.toast_trans('correct-amount');
            return;
        }
        if (this.transfer.amount * this.SELA > this.walletManager.activeMasterWallet.subWallets[this.chainId].balance) {
            this.native.toast_trans('error-amount');
            return;
        }
        if (this.transfer.amount.toString().indexOf('.') > -1 && this.transfer.amount.toString().split(".")[1].length > 8) {
            this.native.toast_trans('correct-amount');
            return;
        }
        try {
            await this.walletManager.spvBridge.isAddressValid(
                this.masterWallet.id,
                this.transfer.toAddress
            );
            this.showConfirm();
        } catch (error) {
            this.native.toast_trans('contact-address-digits');
        }
    }

    async showConfirm() {
        this.showPopover = true;
        let txInfo = {
            type: this.transfer.type,
            transferFrom: this.transfer.chainId,
            transferTo: this.transfer.type === 'recharge' ? this.transfer.sideChainId : this.transfer.toAddress,
            amount: this.transfer.amount
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
                this.transFunction();
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
        this.transfer.toAddress = suggestedAddress.address;

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
