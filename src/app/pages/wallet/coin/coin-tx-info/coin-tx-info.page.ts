import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Events } from '@ionic/angular';
import { Config } from '../../../../config/Config';
import { JsonRPCService } from '../../../../services/jsonrpc.service';
import { Native } from '../../../../services/native.service';
import { Util } from '../../../../model/Util';
import { WalletManager } from '../../../../services/wallet.service';
import { MasterWallet } from 'src/app/model/wallets/MasterWallet';
import { AppService } from 'src/app/services/app.service';
import { StandardCoinName } from 'src/app/model/Coin';
import { TransactionStatus, TransactionDirection, TransactionType, TransactionInfo, Transaction, EthTransaction } from 'src/app/model/Transaction';
import { ThemeService } from 'src/app/services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import BigNumber from 'bignumber.js';
import { SubWallet } from 'src/app/model/wallets/SubWallet';
import { ETHChainSubWallet } from 'src/app/model/wallets/ETHChainSubWallet';
import { getHeapStatistics } from 'v8';

class TransactionDetail {
    type: string;
    title: string;
    value: any = null;
    show: boolean;
}

@Component({
    selector: 'app-coin-tx-info',
    templateUrl: './coin-tx-info.page.html',
    styleUrls: ['./coin-tx-info.page.scss'],
})
export class CoinTxInfoPage implements OnInit {

    // General Values
    private masterWallet: MasterWallet = null;
    public chainId: string = '';
    public subWallet: SubWallet = null;
    public transactionInfo: TransactionInfo;
    private blockchain_url = Config.BLOCKCHAIN_URL;
    private idchain_url = Config.IDCHAIN_URL;

    // Header Display Values
    public type: TransactionType;
    public payStatusIcon: string = '';
    public direction: string = '';
    public symbol: string = '';
    public amount: BigNumber;
    public status: string = '';

    // Other Values
    public payFee: number = null;
    public totalCost: BigNumber = null;
    public payType: string = '';
    public inputs = [];
    public outputs = [];
    public targetAddress = '';

    // List of displayable transaction details
    public txDetails: TransactionDetail[] = [];

    // TODO: it should use callback if the spvsdk can send callback when the confirm count is 6
    preConfirmCount = '';
    hasSubscribeprogressEvent = false;

    constructor(
        public events: Events,
        public router: Router,
        public walletManager: WalletManager,
        public native: Native,
        private appService: AppService,
        public jsonRPCService: JsonRPCService,
        private translate: TranslateService,
        public theme: ThemeService
    ) {
        this.init();
    }

    ngOnInit() {
    }

    ionViewWillEnter() {
        this.appService.setTitleBarTitle(this.translate.instant("tx-info-title"));
        this.appService.setBackKeyVisibility(true);
    }

    ionViewDidLeave() {
        this.unsubscribeprogressEvent();
    }

    init() {
        const navigation = this.router.getCurrentNavigation();
        if (!Util.isEmptyObject(navigation.extras.state)) {

            // General Values
            this.transactionInfo = navigation.extras.state.transactionInfo;
            this.masterWallet = this.walletManager.getMasterWallet(navigation.extras.state.masterWalletId);
            this.chainId = navigation.extras.state.chainId;
            this.subWallet = this.masterWallet.getSubWallet(this.chainId);

            console.log('Tx info', this.transactionInfo);

            // Header display values
            this.type = this.transactionInfo.type;
            this.amount = this.transactionInfo.amount;
            this.symbol = this.transactionInfo.symbol;
            this.payStatusIcon = this.transactionInfo.payStatusIcon;
            const direction = this.transactionInfo.direction;
            if (direction === TransactionDirection.RECEIVED) {
                this.direction = this.translate.instant("tx-info-type-received");
            } else if (direction === TransactionDirection.SENT) {
                this.direction = this.translate.instant("tx-info-type-sent");
            } else if (direction === TransactionDirection.MOVED) {
                this.direction = this.translate.instant("tx-info-type-transferred");
            }

            this.getTransactionDetails();
        }
    }

    async getTransactionDetails() {
        let allTransactions = await this.walletManager.spvBridge.getAllTransactions(
            this.masterWallet.id,
            this.chainId,
            0,
            this.transactionInfo.txId
        );

        const transaction = allTransactions.Transactions[0];
        console.log('More tx info', transaction);

        // Tx is NOT ETH - Define total cost and address
        if ((this.chainId === StandardCoinName.ELA) || (this.chainId === StandardCoinName.IDChain)) {
            // Pay Fee
            this.payFee = this.subWallet.getDisplayAmount(new BigNumber(transaction.Fee)).toNumber();
            // Total Cost
            this.totalCost = this.payFee ? this.transactionInfo.amount.plus(this.payFee) : null;
            // Address
            this.targetAddress = this.getTargetAddressFromTransaction(transaction);

            // If the fee is too small, then amount doesn't subtract fee
            if (transaction.Fee > 10000000000) {
              this.amount = this.amount.minus(this.payFee);
            }

        // Tx is ETH - Define amount, fee, total cost and address
        } else {
            // Amount
            const newAmount = new BigNumber(transaction.Amount);
            this.amount = newAmount.isInteger() ? newAmount.integerValue() : newAmount.decimalPlaces(6);
            // Pay Fee
            const newPayFee = new BigNumber(transaction.Fee);
            this.payFee = newPayFee.toNumber();
            // Total Cost
            this.totalCost = newPayFee ? newAmount.plus(newPayFee) : null;
            // Address
            this.targetAddress = await this.getETHSCWithdrawTransactionTargetAddres(transaction as EthTransaction);
        }

        this.inputs = this.objtoarr(transaction.Inputs);
        this.outputs = this.objtoarr(transaction.Outputs);

        // Get more header display values
        switch (transaction.Status) {
            case TransactionStatus.CONFIRMED:
                this.status = this.translate.instant("coin-transaction-status-confirmed");
                this.unsubscribeprogressEvent();
                break;
            case TransactionStatus.PENDING:
                this.status = this.translate.instant("coin-transaction-status-pending");
                this.subscribeprogressEvent();
                break;
            case TransactionStatus.UNCONFIRMED:
                this.status = this.translate.instant("coin-transaction-status-unconfirmed");
                this.subscribeprogressEvent();
                break;
        }

        this.payType = "transaction-type-13";
        if ((this.type >= 0) && this.type <= 12) {
            if (this.type === 10) {
                if (this.chainId === StandardCoinName.IDChain) {
                    this.payType = "transaction-type-did";
                } else {
                    this.payType = "transaction-type-10";
                }
            } else {
                this.payType = "transaction-type-" + this.type;
            }
        }

        // For vote transaction
        if (!Util.isNull(transaction.OutputPayload) && (transaction.OutputPayload.length > 0)) {
            this.payType = "transaction-type-vote";
        }

        // Create array of displayable tx details
        this.txDetails = [];
        this.txDetails.push(
            {
                type: 'time',
                title: 'tx-info-transaction-time',
                value:
                    this.transactionInfo.timestamp === 0 ?
                        this.translate.instant('coin-transaction-status-pending') :
                        Util.dateFormat(new Date(this.transactionInfo.timestamp), 'YYYY-MM-DD HH:mm:ss'),
                show: true,
            },
            {
                type: 'memo',
                title: 'tx-info-memo',
                value: transaction.Memo,
                show: true,
            },
            {
                type: 'fees',
                title: 'tx-info-transaction-fees',
                value: this.payFee,
                show: false,
            },
            {
                type: 'cost',
                title: 'tx-info-cost',
                value: this.totalCost,
                show: false,
            },
            {
                type: 'confirmations',
                title: 'tx-info-confirmations',
                value: this.transactionInfo.confirmStatus,
                show: false,
            },
            {
                type: 'blockId',
                title: 'tx-info-block-id',
                value: transaction.Height,
                show: false,
            },
            {
                type: 'txId',
                title: 'tx-info-transaction-id',
                value: this.transactionInfo.txId,
                show: false,
            },
        );

        // Only show receiving address if transaction was not received
        if (this.direction !== TransactionDirection.RECEIVED) {
            this.txDetails.unshift(
                {
                    type: 'address',
                    title: 'tx-info-receiver-address',
                    value: this.targetAddress,
                    show: true,
                },
            );
        }

        console.log('Tx details', this.txDetails);
    }

    subscribeprogressEvent() {
        if (!this.hasSubscribeprogressEvent) {
            this.events.subscribe(this.masterWallet.id + ':' + this.chainId + ':syncprogress', (coin) => {
                this.getTransactionDetails();
            });
            this.hasSubscribeprogressEvent = true;
        }
    }
    unsubscribeprogressEvent() {
        if (this.hasSubscribeprogressEvent) {
            this.events.unsubscribe(this.masterWallet.id + ':' + this.chainId + ':syncprogress');
            this.hasSubscribeprogressEvent = false;
        }
    }

    goWebSite(chainId, txId) {
        if (chainId === StandardCoinName.ELA) {
            this.native.openUrl(this.blockchain_url + 'tx/' + txId);
        } else {
            this.native.openUrl(this.idchain_url + 'tx/' + txId);
        }
    }

    doRefresh(event) {
        this.init();
        setTimeout(() => {
            event.target.complete();
        }, 1000);
    }

    objtoarr(obj) {
        let arr = []
        if (obj) {
            for (let i in obj) {
                if (arr.length < 3)
                    arr.push({ "address": i, "balance": obj[i] / Config.SELA });
            }

            if (arr.length > 2) {
                arr.push({ "address": "...........", "balance": "............." });
                return arr;
            }
        }
        return arr;
    }

    /**
     * Get target address
     */
    getTargetAddressFromTransaction(transaction: Transaction): string {
        let targetAddress = '';
        if (transaction.Outputs) {
            for (const key in transaction.Outputs) {
                if (transaction.Amount === transaction.Outputs[key]) {
                    targetAddress = key;
                    break;
                }
            }
        }
        return targetAddress;
    }

    /**
     * Get the real targeAddress by rpc
     */
    async getETHSCWithdrawTransactionTargetAddres(transaction: EthTransaction) {
        let targetAddress = transaction.TargetAddress;
        const withdrawContractAddress = await (this.subWallet as ETHChainSubWallet).getWithdrawContractAddress();
        if (transaction.TargetAddress === withdrawContractAddress) {
            targetAddress = await this.jsonRPCService.getETHSCWithdrawTargetAddress(transaction.BlockNumber + 6, transaction.Hash);
            // If the targetAddress is empty, then this transaction is error.
            // TODO: But now, the spvsdk does not set any flag to this transaction. 2020.9.29
        }
        return targetAddress;
    }

    getDisplayableName(): string {
        if (this.chainId === 'IDChain') {
            return 'ELA';
        } else {
            return this.chainId;
        }
    }

    getTransferClass() {
        switch (this.type) {
            case 1:
                return 'received';
            case 2:
                return 'sent';
            case 3:
                return 'transferred';
        }
    }

    worthCopying(item: TransactionDetail) {
        if (item.type === 'blockId' || item.type === 'txId' || item.type === 'address') {
            return true;
        } else {
            return false;
        }
    }

    copy(value) {
        this.native.copyClipboard(value);
        this.native.toast_trans('copied');
    }
}

