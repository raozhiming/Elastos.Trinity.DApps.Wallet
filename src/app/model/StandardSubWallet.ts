import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import * as TrinitySDK from '@elastosfoundation/trinity-dapp-sdk';
import { MasterWallet } from './MasterWallet';
import { SubWallet, SerializedSubWallet } from './SubWallet';
import { CoinType, Coin, StandardCoinName } from './Coin';
import { Util } from './Util';
import { AllTransactions } from './Transaction';
import * as moment from 'moment';
import { Transfer } from '../services/cointransfer.service';
import { Config } from '../config/Config';
import BigNumber from 'bignumber.js';

declare let appManager: AppManagerPlugin.AppManager;

export class StandardSubWallet extends SubWallet {
    constructor(masterWallet: MasterWallet, id: StandardCoinName) {
        super(masterWallet, id, CoinType.STANDARD);

        this.initialize();
    }

    private initialize() {
        // this.masterWallet.walletManager.registerSubWalletListener();
        this.initLastBlockInfo();
        this.updateBalance();
    }

    public static async newFromCoin(masterWallet: MasterWallet, coin: Coin): Promise<StandardSubWallet> {
        let coinName = StandardCoinName.fromCoinID(coin.getID());

        // Create the subwallet in the SPV SDK first, before creating it in our model, as further function
        // calls need the SPV entry to be ready.
        await masterWallet.walletManager.spvBridge.createSubWallet(masterWallet.id, coinName);

        let subWallet = new StandardSubWallet(masterWallet, coinName);

        return subWallet;
    }

    public static newFromSerializedSubWallet(masterWallet: MasterWallet, serializedSubWallet: SerializedSubWallet): StandardSubWallet {
        console.log("Initializing standard subwallet from serialized sub wallet", serializedSubWallet);
        let subWallet = new StandardSubWallet(masterWallet, serializedSubWallet.id);
        subWallet.initFromSerializedSubWallet(serializedSubWallet);
        return subWallet;
    }

    public async destroy() {
        this.masterWallet.walletManager.stopSubWalletSync(this.masterWallet.id, this.id as StandardCoinName);
        await this.masterWallet.walletManager.spvBridge.destroySubWallet(this.masterWallet.id, this.id);

        super.destroy();
    }

    /**
     * Get the last block info from the local data.
     */
    public async initLastBlockInfo() {
        // Get the last block info from the wallet plugin.
        const blockInfo = await this.masterWallet.walletManager.spvBridge.getLastBlockInfo(this.masterWallet.id, this.id);

        if (blockInfo) this.updateSyncProgress(0, blockInfo.Timestamp);
    }

    public async createAddress(): Promise<string> {
        return await this.masterWallet.walletManager.spvBridge.createAddress(this.masterWallet.id, this.id);
    }

    public getFriendlyName(): string {
        const coin = this.masterWallet.coinService.getCoinByID(this.id);
        if (!coin) {
            return ''; // Just in case
        }

        return coin.getDescription();
    }

    public getDisplayTokenName(): string {
        const coin = this.masterWallet.coinService.getCoinByID(this.id);
        if (!coin) {
            return ''; // Just in case
        }

        return coin.getName();
    }

    public getDisplayBalance(): BigNumber {
        return this.balance.dividedBy(Config.SELAAsBigNumber);
    }

    /**
     * Check whether the balance is enough.
     * @param amount unit is ELA
     */
    public isBalanceEnough(amount: BigNumber) {
        return this.balance.gt(amount.multipliedBy(Config.SELAAsBigNumber));
    }

    /**
     * Requests a wallet to update its balance. Usually called when we receive an event from the SPV SDK,
     * saying that a new balance amount is available.
     */
    public async updateBalance() {
        if (this.id === StandardCoinName.ETHSC) {
            let balanceStr = await this.masterWallet.walletManager.spvBridge.getBalance(this.masterWallet.id, this.id);
            // TODO: use Ether? Gwei? Wei?
            this.balance = new BigNumber(balanceStr).multipliedBy(Config.SELAAsBigNumber);
        } else {
            // if the balance form spvsdk is newer, then use it.
            if (!this.lastBlockTime || (moment(this.lastBlockTime).valueOf() > this.timestampRPC)) {
                // Get the current balance from the wallet plugin.
                let balanceStr = await this.masterWallet.walletManager.spvBridge.getBalance(this.masterWallet.id, this.id);

                // Balance in SELA
                this.balance = new BigNumber(balanceStr, 10);
            }
        }
    }

    public async getTransactions(startIndex: number): Promise<AllTransactions> {
        let allTransactions = await this.masterWallet.walletManager.spvBridge.getAllTransactions(this.masterWallet.id, this.id, startIndex, '');
        console.log("Get all transaction count for coin "+this.id+": ", allTransactions && allTransactions.Transactions ? allTransactions.Transactions.length : -1, "startIndex: ", startIndex);
        return allTransactions;
    }

   /*
    * Updates current SPV synchonization progress information for this coin.
    */
   public updateSyncProgress(progress: number, lastBlockTime: number) {
        const userReadableDateTime = Util.dateFormat(new Date(lastBlockTime * 1000), 'YYYY-MM-DD HH:mm:ss');
        this.progress = progress;
        this.lastBlockTime = userReadableDateTime;

        console.log("Standard subwallet "+this.id+" got update sync progress request. Progress = "+progress);

        const curTimestampMs = (new Date()).getTime();
        if (curTimestampMs - this.timestamp > 5000) { // 5s
            this.masterWallet.walletManager.events.publish(this.id + ':syncprogress', this.id);
            this.timestamp = curTimestampMs;
        }

        if (progress === 100) {
            const eventId = this.masterWallet.id + ':' + this.id + ':synccompleted';
            this.masterWallet.walletManager.events.publish(eventId, this.id);
        }
    }

    public async createPaymentTransaction(toAddress: string, amount: string, memo: string): Promise<string> {
        let rawTx = '';
        if (this.id === StandardCoinName.ETHSC) {
            rawTx = await this.masterWallet.walletManager.spvBridge.createTransfer(
                this.masterWallet.id,
                toAddress,
                amount,
                6 // ETHER_ETHER
            );
        } else {// ELA, IDChain
            rawTx = await this.masterWallet.walletManager.spvBridge.createTransaction(
                this.masterWallet.id,
                this.id, // From subwallet id
                '', // From address, not necessary
                toAddress,
                amount,
                memo // User input memo
            );
        }
        return rawTx;
    }

    /**
     * Send ELA from ETHSC to mainchain by smartcontract
     */
    private getContractAddress(): Promise<string> {
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

    public async createWithdrawTransaction(toAddress: string, toAmount: number, memo: string): Promise<string> {
        let rawTx = '';
        if (this.id === StandardCoinName.ETHSC) {
            const provider = new TrinitySDK.Ethereum.Web3.Providers.TrinityWeb3Provider();
            const web3 = new Web3(provider);

            const contractAbi = require('../../assets/ethereum/ETHSCWithdrawABI.json');
            const contractAddress = await this.getContractAddress();
            console.log('contractAbi:', contractAbi)
            const ethscWithdrawContract = new web3.eth.Contract(contractAbi, contractAddress);
            let gasPrice = await web3.eth.getGasPrice();

            console.log('---- createWithdrawTransaction toAmount:', toAmount, ' toAddress:', toAddress, ' contractAddress:', contractAddress, ' gasPrice:', gasPrice);

            let toAmountSend = web3.utils.toWei(toAmount.toString(), 'ether');
            let data = ethscWithdrawContract.methods.receivePayload(toAddress, toAmountSend, 10000000000000).encodeABI();
            console.log('toAmountSend:', toAmountSend)
            console.log('data:', data)
            rawTx = await this.masterWallet.walletManager.spvBridge.createTransferGeneric(
                this.masterWallet.id,
                contractAddress,
                toAmountSend,
                0, // WEI
                '10000000000',
                0, // WEI
                '3000000', // TODO: gasLimit
                data,
            );
        } else {// IDChain
            rawTx = await this.masterWallet.walletManager.spvBridge.createWithdrawTransaction(
                this.masterWallet.id,
                this.id, // From subwallet id
                '',
                toAmount.toString(),
                toAddress,
                memo
            );
        }

        console.log('----rawTx:', rawTx);

        return rawTx;
    }

    /**
     * Signs raw transaction and sends the signed transaction to the SPV SDK for publication.
     */
    public async signAndSendRawTransaction(transaction: string, transfer: Transfer): Promise<void> {
        return new Promise(async (resolve)=>{
            console.log('Received raw transaction', transaction);
            let password = await this.masterWallet.walletManager.openPayModal(transfer);
            if (!password) {
                console.log("No password received. Cancelling");
                await this.masterWallet.walletManager.sendIntentResponse(transfer.action,
                    { txid: null, status: 'cancelled' }, transfer.intentId);
                resolve(null);
                return;
            }

            console.log("Password retrieved. Now signing the transaction.");

            await this.masterWallet.walletManager.native.showLoading();

            const signedTx = await this.masterWallet.walletManager.spvBridge.signTransaction(
                this.masterWallet.id,
                this.id,
                transaction,
                password
            );

            console.log("Transaction signed. Now publishing.");

            const publishedTransaction =
            await this.masterWallet.walletManager.spvBridge.publishTransaction(
                this.masterWallet.id,
                this.id,
                signedTx
            );

            this.masterWallet.walletManager.setRecentWalletId(this.masterWallet.id);

            if (!Util.isEmptyObject(transfer.action)) {
                console.log("Mode: transfer with intent action");
                this.masterWallet.walletManager.lockTx(publishedTransaction.TxHash);

                setTimeout(async () => {
                    let status = 'published';
                    let txId = publishedTransaction.TxHash;
                    const code = this.masterWallet.walletManager.getTxCode(txId);
                    if (code !== 0) {
                        txId = null;
                        status = 'error';
                    }
                    this.masterWallet.walletManager.native.hideLoading();
                    this.masterWallet.walletManager.native.toast_trans('transaction-has-been-published');
                    console.log('Sending intent response', transfer.action, { txid: txId }, transfer.intentId);
                    await this.masterWallet.walletManager.sendIntentResponse(transfer.action,
                        { txid: txId, status }, transfer.intentId);
                    appManager.close();

                    resolve();
                }, 5000); // wait for 5s for txPublished
            } else {
                console.log("Published transaction id:", publishedTransaction.TxHash);

                await this.masterWallet.walletManager.native.hideLoading();
                this.masterWallet.walletManager.native.toast_trans('transaction-has-been-published');
                await this.masterWallet.walletManager.native.setRootRouter('/wallet-home');

                resolve();
            }
        });
    }
}
