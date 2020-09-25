import { StandardSubWallet } from './StandardSubWallet';
import BigNumber from 'bignumber.js';
import { Config } from '../config/Config';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import * as TrinitySDK from '@elastosfoundation/trinity-dapp-sdk';

declare let appManager: AppManagerPlugin.AppManager;

/**
 * Specialized standard sub wallet for the ETH sidechain.
 */
export class ETHChainSubWallet extends StandardSubWallet {
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

    /**
     * Use smartcontract to Send ELA from ETHSC to mainchain.
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
        const provider = new TrinitySDK.Ethereum.Web3.Providers.TrinityWeb3Provider();
            const web3 = new Web3(provider);

            const contractAbi = require('../../assets/ethereum/ETHSCWithdrawABI.json');
            const contractAddress = await this.getContractAddress();
            const ethscWithdrawContract = new web3.eth.Contract(contractAbi, contractAddress);
            const gasPrice = await web3.eth.getGasPrice();

            const toAmountSend = web3.utils.toWei(toAmount.toString());
            const data = ethscWithdrawContract.methods.receivePayload(toAddress, toAmountSend, Config.ETHSC_WITHDRAW_GASPRICE).encodeABI();
            return this.masterWallet.walletManager.spvBridge.createTransferGeneric(
                this.masterWallet.id,
                contractAddress,
                toAmountSend,
                0, // WEI
                gasPrice,
                0, // WEI
                '3000000', // TODO: gasLimit
                data,
            );
    }
}