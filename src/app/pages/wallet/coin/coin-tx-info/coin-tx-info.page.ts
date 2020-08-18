import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events } from '@ionic/angular';
import { Config } from '../../../../config/Config';
import { Native } from '../../../../services/native.service';
import { Util } from '../../../../model/Util';
import { WalletManager } from '../../../../services/wallet.service';
import { MasterWallet } from 'src/app/model/MasterWallet';
import { AppService } from 'src/app/services/app.service';
import { StandardCoinName } from 'src/app/model/Coin';
import { TransactionStatus, TransactionDirection } from 'src/app/model/Transaction';
import { ThemeService } from 'src/app/services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { ThrowStmt } from '@angular/compiler';

enum TransactionType {
    RECEIVE = 1,
    SENT = 2,
    TRANSFER = 3
}

@Component({
    selector: 'app-coin-tx-info',
    templateUrl: './coin-tx-info.page.html',
    styleUrls: ['./coin-tx-info.page.scss'],
})
export class CoinTxInfoPage implements OnInit {

    private masterWallet: MasterWallet = null;
    private blockchain_url = Config.BLOCKCHAIN_URL;
    private idchain_url = Config.IDCHAIN_URL;

    // Header display
    public type: TransactionType;
    public direction: string = '';
    public payStatusIcon: string = '';
    public symbol: string = '';

    // Params data
    public txId: string = '';
    public name: string = '';

    // Raw tx data
    public memo: string = '';
    public confirmCount: any;
    public timestamp: number;

    // Modified data
    public status: string = '';
    public resultAmount: string = '';
    public payFee: number;
    public datetime: any;
    public payType: string = '';
    public inputs = [];
    public outputs = [];

    // Tabs
    public timeActive: boolean = true;
    public memoActive: boolean = true;
    public confirmActive: boolean = false;
    public feesActive: boolean = false;
    public txActive: boolean = false;

    // TODO: it should use callback if the spvsdk can send callback when the confirm count is 6
    preConfirmCount = '';
    hasSubscribeprogressEvent = false;

    constructor(
        public events: Events,
        public route: ActivatedRoute,
        public walletManager: WalletManager,
        public native: Native,
        private appService: AppService,
        private translate: TranslateService,
        public theme: ThemeService
    ) {
    }

    ngOnInit() {
    }

    ionViewWillEnter() {
        this.appService.setBackKeyVisibility(true);
        this.init();
    }

    ionViewDidLeave() {
        this.unsubscribeprogressEvent();
    }

    init() {
        this.masterWallet = this.walletManager.getActiveMasterWallet();
        this.route.queryParams.subscribe((data) => {
            this.txId = data.txId;
            this.name = data.chainId;

            this.appService.setTitleBarTitle(this.translate.instant("tx-info-title"));

            this.getTransactionInfo();
        });
    }

    async getTransactionInfo() {
        let allTransactions = await this.walletManager.spvBridge.getAllTransactions(this.masterWallet.id, this.name, 0, this.txId);
        let transaction = allTransactions.Transactions[0];
        console.log('Raw tx', transaction);

        // Raw data
        this.timestamp = transaction.Timestamp * 1000;
        this.confirmCount = transaction.ConfirmStatus;
        this.memo = transaction.Memo;

        // Modified data
        this.datetime = this.timestamp === 0 ? this.translate.instant("coin-transaction-status-pending") : Util.dateFormat(new Date(this.timestamp), 'YYYY-MM-DD HH:mm:ss');
        this.resultAmount = Util.scientificToNumber(transaction.Amount / Config.SELA);
        this.payFee = Util.scientificToNumber(transaction.Fee / Config.SELA);
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

        // Display header data
        let direction = transaction.Direction;
        if (direction === TransactionDirection.RECEIVED) {
            this.type = 1;
            this.direction = this.translate.instant("tx-info-type-received");
            this.payStatusIcon = '/assets/buttons/receive.png';
            this.symbol = "+";
        } else if (direction === TransactionDirection.SENT) {
            this.type = 2;
            this.direction = this.translate.instant("tx-info-type-sent");
            this.payStatusIcon = '/assets/buttons/send.png';
            this.symbol = "-";
        } else if (direction === TransactionDirection.MOVED) {
            this.type = 3;
            this.direction = this.translate.instant("tx-info-type-transferred");
            this.payStatusIcon = '/assets/buttons/transfer.png';
            this.symbol = "";
        }

        this.payType = "transaction-type-13";
        if ((transaction.Type >= 0) && transaction.Type <= 12) {
            if (transaction.Type === 10) {
                if (this.name === StandardCoinName.IDChain) {
                    this.payType = "transaction-type-did";
                } else {
                    this.payType = "transaction-type-10";
                }
            } else {
                this.payType = "transaction-type-" + transaction.Type;
            }
        }

        // For vote transaction
        if (!Util.isNull(transaction.OutputPayload) && (transaction.OutputPayload.length > 0)) {
            this.payType = "transaction-type-vote";
        }
    }

    subscribeprogressEvent() {
        if (!this.hasSubscribeprogressEvent) {
            this.events.subscribe(this.name + ':syncprogress', (coin) => {
                this.getTransactionInfo();
            });
            this.hasSubscribeprogressEvent = true;
        }
    }
    unsubscribeprogressEvent() {
        if (this.hasSubscribeprogressEvent) {
            this.events.unsubscribe(this.name + ':syncprogress');
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

    getDisplayableName(): string {
        if (this.name === 'IDChain') {
            return 'ELA';
        } else {
            return this.name;
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

