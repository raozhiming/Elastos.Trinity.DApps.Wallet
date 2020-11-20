import { StandardSubWallet } from './StandardSubWallet';
import BigNumber from 'bignumber.js';
import { Config } from '../../config/Config';
import Web3 from 'web3';
import * as TrinitySDK from '@elastosfoundation/trinity-dapp-sdk';
import { EthTransaction, TransactionDirection, TransactionInfo, TransactionType } from '../Transaction';
import { StandardCoinName } from '../Coin';
import { MasterWallet } from './MasterWallet';
import { TranslateService } from '@ngx-translate/core';

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

    private async getTokenAddress(): Promise<string> {
        if (!this.ethscAddress) {
            this.ethscAddress = await this.createAddress();
        }
        return this.ethscAddress;
    }

    /**
     * Use smartcontract to Send ELA from ETHSC to mainchain.
     */
    public getWithdrawContractAddress(): Promise<string> {
        return new Promise((resolve) => {
            if (this.withdrawContractAddress) {
                resolve(this.withdrawContractAddress);
            } else {
                appManager.getPreference('chain.network.type', (value) => {
                    if (value === 'MainNet') {
                        this.withdrawContractAddress = Config.CONTRACT_ADDRESS_MAINNET;
                        resolve(this.withdrawContractAddress);
                    } else if (value === 'TestNet') {
                        this.withdrawContractAddress = Config.CONTRACT_ADDRESS_MAINNET;
                        resolve(this.withdrawContractAddress);
                    } else {
                        resolve(null);
                    }
                });
            }
        });
    }

    public async getTransactionInfo(transaction: EthTransaction, translate: TranslateService): Promise<TransactionInfo> {
        const transactionInfo = await super.getTransactionInfo(transaction, translate);
        const direction = await this.getETHSCTransactionDirection(transaction.TargetAddress);

        // TODO: Why BlockNumber is 0 sometimes? Need to check.
        // if (transaction.IsErrored || (transaction.BlockNumber === 0)) {
        if (transaction.IsErrored) {
            return null;
        }

        transactionInfo.amount = new BigNumber(transaction.Amount).dividedBy(Config.WEI);
        transactionInfo.fee = transaction.Fee / Config.WEI;
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
        const direction = await this.getETHSCTransactionDirection(transaction.TargetAddress);
        switch (direction) {
            case TransactionDirection.RECEIVED:
                return translate.instant("coin-op-received-ela");
            case TransactionDirection.SENT:
                return translate.instant("coin-op-sent-ela");
        }
        return null;
    }

    protected async getTransactionIconPath(transaction: EthTransaction): Promise<string> {
        const direction = await this.getETHSCTransactionDirection(transaction.TargetAddress);
        switch (direction) {
            case TransactionDirection.RECEIVED:
                return './assets/buttons/receive.png';
            case TransactionDirection.SENT:
                return './assets/buttons/send.png';
        }
    }

    private async getETHSCTransactionDirection(targetAddress: string): Promise<TransactionDirection> {
        const address = await this.getTokenAddress();
        if (address === targetAddress) {
            return TransactionDirection.RECEIVED;
        } else {
            return TransactionDirection.SENT;
        }
    }

    public async updateBalance(): Promise<void> {
        const balanceStr = await this.masterWallet.walletManager.spvBridge.getBalance(this.masterWallet.id, this.id);
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

        const gasLimit = 100000;
        // TODO: The value from estimateGas is too small sometimes (eg 22384) for withdraw transaction.
        // Maybe it is the bug of node?
        // try {
        //     // Estimate gas cost
        //     gasLimit = await method.estimateGas();
        // } catch (error) {
        //     console.log('estimateGas error:', error);
        // }

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
