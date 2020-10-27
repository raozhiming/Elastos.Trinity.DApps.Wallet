import { StandardSubWallet } from './StandardSubWallet';
import BigNumber from 'bignumber.js';
import { Config } from '../../config/Config';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import * as TrinitySDK from '@elastosfoundation/trinity-dapp-sdk';
import { EthTransaction, Transaction, TransactionDirection, TransactionInfo, TransactionType } from '../Transaction';
import { StandardCoinName } from '../Coin';
import { MasterWallet } from './MasterWallet';
import { TranslateService } from '@ngx-translate/core';
import { transition } from '@angular/animations';

declare let appManager: AppManagerPlugin.AppManager;

/**
 * Specialized standard sub wallet for the ETH sidechain.
 */
export class ETHChainSubWallet extends StandardSubWallet {
    private ethscAddress: string = null;
    private withdrawContractAddress: string = null;

    constructor(masterWallet: MasterWallet) {
        super(masterWallet, StandardCoinName.ETHSC);
    }

    private async getAddress(): Promise<string> {
        if (this.ethscAddress)
            return Promise.resolve(this.ethscAddress);

        this.ethscAddress = await this.createAddress();
    }

    /**
     * Use smartcontract to Send ELA from ETHSC to mainchain.
     */
    public getWithdrawContractAddress(): Promise<string> {
        if (this.withdrawContractAddress)
            return Promise.resolve(this.withdrawContractAddress);

        return new Promise((resolve) => {
            appManager.getPreference('chain.network.type', (value) => {
                if (value === 'MainNet') {
                    resolve(Config.CONTRACT_ADDRESS_MAINNET);
                } else if (value === 'TestNet') {
                    resolve(Config.CONTRACT_ADDRESS_TESTNET);
                } else {
                    resolve(null);
                }
            });
        });
    }

    public async getTransactionInfo(transaction: EthTransaction, translate: TranslateService): Promise<TransactionInfo> {
        let transactionInfo = await super.getTransactionInfo(transaction, translate);
        let direction = await this.getETHSCTransactionDirection(transaction.TargetAddress);

        if (transaction.IsErrored || (transaction.BlockNumber === 0)) {
            return null;
        }

        transactionInfo.amount = new BigNumber(transaction.Amount).dividedBy(Config.WEI);
        transactionInfo.fee = transaction.Fee / Config.WEI;
        transactionInfo.direction = await this.getETHSCTransactionDirection(transaction.TargetAddress);
        transactionInfo.txId = transaction.TxHash || transaction.Hash; // ETHSC use TD or Hash

        // ETHSC use Confirmations - TODO: FIX THIS - SHOULD BE EITHER CONFIRMSTATUS (mainchain) or CONFIRMATIONS BUT NOT BOTH
        transactionInfo.confirmStatus = transaction.Confirmations;

        // MESSY again - No "Direction" field in ETH transactions (contrary to other chains). Calling a private method to determine this.
        if (direction === TransactionDirection.RECEIVED) {
            transactionInfo.type = TransactionType.RECEIVED;
            transactionInfo.symbol = '+';
        } else if (direction === TransactionDirection.SENT) {
            transactionInfo.type = TransactionType.SENT;
            transactionInfo.symbol = '-';
        } else if (direction === TransactionDirection.MOVED) {
            transactionInfo.type = TransactionType.TRANSFER;
            transactionInfo.symbol = '';
        }

        return transactionInfo;
    }

    // TODO: https://app.clickup.com/t/4fu5cw - "Get the transaction type from ETHSC  transaction"
    protected async getTransactionName(transaction: EthTransaction, translate: TranslateService): Promise<string> {
        let direction = await this.getETHSCTransactionDirection(transaction.TargetAddress);
        switch (direction) {
            case TransactionDirection.RECEIVED:
                return translate.instant("coin-op-received-ela");
            case TransactionDirection.SENT:
                return translate.instant("coin-op-sent-ela");
        }
        return null;
    }

    protected async getTransactionIconPath(transaction: EthTransaction): Promise<string> {
        let direction = await this.getETHSCTransactionDirection(transaction.TargetAddress);
        switch (direction) {
            case TransactionDirection.RECEIVED:
                return './assets/buttons/receive.png';
            case TransactionDirection.SENT:
                return './assets/buttons/send.png';
        }
    }

    private async getETHSCTransactionDirection(targetAddress: string): Promise<TransactionDirection> {
        let address = await this.getAddress();
        if (address === targetAddress) {
            return TransactionDirection.RECEIVED;
        } else {
            return TransactionDirection.SENT;
        }
    }

    public async updateBalance(): Promise<void> {
        let balanceStr = await this.masterWallet.walletManager.spvBridge.getBalance(this.masterWallet.id, this.id);
        // TODO: use Ether? Gwei? Wei?
        this.balance = new BigNumber(balanceStr).multipliedBy(Config.SELAAsBigNumber);
    }

    public async createPaymentTransaction(toAddress: string, amount: string, memo: string): Promise<string> {
        return this.masterWallet.walletManager.spvBridge.createTransfer(
            this.masterWallet.id,
            toAddress,
            amount,
            6 // ETHER_ETHER
        );
    }

    public async createWithdrawTransaction(toAddress: string, toAmount: number, memo: string): Promise<string> {
        const provider = new TrinitySDK.Ethereum.Web3.Providers.TrinityWeb3Provider();
        const web3 = new Web3(provider);

        const contractAbi = require('../../../assets/ethereum/ETHSCWithdrawABI.json');
        const contractAddress = await this.getWithdrawContractAddress();
        const ethscWithdrawContract = new web3.eth.Contract(contractAbi, contractAddress);
        const gasPrice = await web3.eth.getGasPrice();
        const toAmountSend = web3.utils.toWei(toAmount.toString());

        const method = ethscWithdrawContract.methods.receivePayload(toAddress, toAmountSend, Config.ETHSC_WITHDRAW_GASPRICE);

        let gasLimit = 100000;
        try {
            // Estimate gas cost
            gasLimit = await method.estimateGas();
        } catch (error) {
            console.log('estimateGas error:', error);
        }

        const data = method.encodeABI();
        return this.masterWallet.walletManager.spvBridge.createTransferGeneric(
            this.masterWallet.id,
            contractAddress,
            toAmountSend,
            0, // WEI
            gasPrice,
            0, // WEI
            gasLimit.toString(),
            data,
        );
    }
}
