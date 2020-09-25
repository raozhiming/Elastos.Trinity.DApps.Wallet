import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Events } from '@ionic/angular';
import { Config } from '../../../../config/Config';
import { Native } from '../../../../services/native.service';
import { Util } from '../../../../model/Util';
import { WalletManager } from '../../../../services/wallet.service';
import { MasterWallet } from 'src/app/model/wallets/MasterWallet';
import { AppService } from 'src/app/services/app.service';
import { StandardCoinName } from 'src/app/model/Coin';
import { TransactionStatus, TransactionDirection, TransactionType, TransactionInfo, Transaction } from 'src/app/model/Transaction';
import { ThemeService } from 'src/app/services/theme.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
    selector: 'app-coin-tx-info',
    templateUrl: './coin-tx-info.page.html',
    styleUrls: ['./coin-tx-info.page.scss'],
})
export class CoinTxInfoPage implements OnInit {

    private masterWallet: MasterWallet = null;
    private transactionInfo: TransactionInfo;
    private blockchain_url = Config.BLOCKCHAIN_URL;
    private idchain_url = Config.IDCHAIN_URL;

    // Header display
    public type: TransactionType;
    public direction: string = '';
    public payStatusIcon: string = '';
    public symbol: string = '';

    // Params data
    public txId: string = '';
    public chainId: string = '';

    // Raw tx data
    public memo: string = '';
    public confirmCount: any;
    public timestamp: number;

    // Modified data
    public status: string = '';
    public amount: string;
    public payFee: number;
    public datetime: any;
    public payType: string = '';
    public inputs = [];
    public outputs = [];
    public targetAddress = '';

    // Tabs
    public memoActive: boolean = true;
    public timeActive: boolean = true;
    public targetActive = true;
    // public inputAtive: boolean = false;
    // public outputAtive: boolean = false;
    public confirmActive: boolean = false;
    public feesActive: boolean = false;
    public txActive: boolean = false;

    // TODO: it should use callback if the spvsdk can send callback when the confirm count is 6
    preConfirmCount = '';
    hasSubscribeprogressEvent = false;

    constructor(
        public events: Events,
        public router: Router,
        public walletManager: WalletManager,
        public native: Native,
        private appService: AppService,
        private translate: TranslateService,
        public theme: ThemeService
    ) {
        this.init();
    }

    ngOnInit() {
    }

    ionViewWillEnter() {
        this.appService.setBackKeyVisibility(true);
    }

    ionViewDidLeave() {
        this.unsubscribeprogressEvent();
    }

    init() {
        this.appService.setTitleBarTitle(this.translate.instant("tx-info-title"));

        const navigation = this.router.getCurrentNavigation();
        if (!Util.isEmptyObject(navigation.extras.state)) {
            this.transactionInfo = navigation.extras.state.transactionInfo;

            this.masterWallet = this.walletManager.getMasterWallet(navigation.extras.state.masterWalletId);
            this.chainId = navigation.extras.state.chainId;
            // Raw data
            this.amount = this.transactionInfo.amount;
            // this.timestamp = this.transactionInfo.timestamp * 1000;
            this.datetime =  this.transactionInfo.timestamp === 0 ? this.translate.instant('coin-transaction-status-pending')
                : Util.dateFormat(new Date(this.transactionInfo.timestamp), 'YYYY-MM-DD HH:mm:ss');
            this.confirmCount = this.transactionInfo.confirmStatus;
            this.memo = this.transactionInfo.memo;
            this.symbol = this.transactionInfo.symbol;
            this.type = this.transactionInfo.type;
            this.payFee = this.transactionInfo.fee;
            this.payStatusIcon = this.transactionInfo.payStatusIcon;
            this.txId = this.transactionInfo.txId;

            // Display header data
            let direction = this.transactionInfo.direction;
            if (direction === TransactionDirection.RECEIVED) {
                this.direction = this.translate.instant("tx-info-type-received");
            } else if (direction === TransactionDirection.SENT) {
                this.direction = this.translate.instant("tx-info-type-sent");
            } else if (direction === TransactionDirection.MOVED) {
                this.direction = this.translate.instant("tx-info-type-transferred");
            }

            this.getTransactionInfo();
        }
    }

    async getTransactionInfo() {
        let allTransactions = await this.walletManager.spvBridge.getAllTransactions(this.masterWallet.id,
            this.chainId, 0, this.transactionInfo.txId);
        let transaction = allTransactions.Transactions[0];
        console.log('Raw tx', transaction);

        if ((this.chainId === StandardCoinName.ELA) || (this.chainId === StandardCoinName.IDChain)) { // ELA, IDChain
            this.payFee = transaction.Fee / Config.SELA;
            this.targetAddress = this.getTargetAddressFromTransaction(transaction);
        } else {
            // TODO: How to distinguish between ordinary transfers and smart contracts
            this.targetAddress = transaction.TargetAddress;
        }
        this.inputs = this.objtoarr(transaction.Inputs);
        this.outputs = this.objtoarr(transaction.Outputs);

        // Display header data
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
    }

    subscribeprogressEvent() {
        if (!this.hasSubscribeprogressEvent) {
            this.events.subscribe(this.masterWallet.id + ':' + this.chainId + ':syncprogress', (coin) => {
                this.getTransactionInfo();
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

    copyAddress(address) {
        this.native.copyClipboard(address);
        this.native.toast_trans('copy-ok');
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
}

