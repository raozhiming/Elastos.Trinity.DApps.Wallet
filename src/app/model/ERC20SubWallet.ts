import path from 'path'
//var fs = require('fs');
import Web3 from 'Web3'
//var Tx = require('ethereumjs-tx');
//import { TrinitySDK } from "@elastosfoundation/trinity-dapp-sdk"
import { TrinitySDK } from "../../../../../../../Elastos.Trinity.DAppSDK/dist"
 
import { MasterWallet } from './MasterWallet';
import { SubWallet, SerializedSubWallet } from './SubWallet';
import { CoinType, CoinID, Coin, ERC20Coin } from './Coin';
import { Config } from '../config/Config';
import { Util } from './Util';

export class ERC20SubWallet extends SubWallet {
    /** Coin related to this wallet */
    private coin: ERC20Coin;
    /** Web3 variables to call smart contracts */
    private web3: Web3;
    private erc20ABI: any;

    constructor(masterWallet: MasterWallet, id: CoinID) {
        super(masterWallet, id, CoinType.ERC20);

        this.initialize();
    }

    private initialize() {
        this.coin = this.masterWallet.coinService.getCoinByID(this.id) as ERC20Coin;

        // Get Web3 and the ERC20 contract ready
        let trinityWeb3Provider = new TrinitySDK.Ethereum.Web3.Providers.TrinityWeb3Provider();
        this.web3 = new Web3(trinityWeb3Provider);

        // Standard ERC20 contract ABI
        this.erc20ABI = require("../../assets/ethereum/StandardErc20ABI.json");

        this.updateBalance();
    }

    public static newFromCoin(masterWallet: MasterWallet, coin: Coin): Promise<ERC20SubWallet> {
        let subWallet = new ERC20SubWallet(masterWallet, coin.getID());
        return Promise.resolve(subWallet);
    }

    public static newFromSerializedSubWallet(masterWallet: MasterWallet, serializedSubWallet: SerializedSubWallet): ERC20SubWallet {
        console.log("Initializing ERC20 subwallet from serialized sub wallet", serializedSubWallet);
        
        let subWallet = new ERC20SubWallet(masterWallet, serializedSubWallet.id);
        Object.assign(subWallet, serializedSubWallet);
        return subWallet;
    }

    public async updateBalance() {
        console.log("Updating ERC20 token balance", this.id);
        
        // TMP - TODO: replace with real user account when we can get it from the SPV SDK
        var myAddress = "0x40da0e9AD0f40A6e26eC03c49eCCec01e2B8f9d4"; // SongSJun cryptoname self account

        var contractAddress = this.coin.getContractAddress();
        let erc20Contract = new this.web3.eth.Contract(this.erc20ABI, contractAddress, { from: myAddress });

        let balanceEla = await erc20Contract.methods.balanceOf(myAddress).call();
        this.balance = balanceEla * Config.SELA;

        // Update the "last sync" date. Just consider this http call date as the sync date for now
        this.timestamp = new Date().getTime();
        this.lastBlockTime = Util.dateFormat(new Date(this.timestamp), 'yyyy-MM-dd HH:mm:ss');
        this.progress = 100;
    }

    public getTransactions(startIndex: number): Promise<any> {
        // TODO: How to get all transactions that happened between a user account and a ERC20 contract?
        // Do we have to make a local cache as this may be slow to check all blocks for transactions?
        // After the SPV SDK is synced and we get all transactions, we can probably filter transfers to/from the
        // ERC20 contract and cache it.
        return Promise.resolve([]);
    }

    async tempInitialTestToUseERC20Stuff() {
        /*
        // Determine the nonce
        var count = await web3.eth.getTransactionCount(myAddress);
        console.log(`num transactions so far: ${count}`);

        // Who are we trying to send this token to?
        var destAddress = "0x4f...";

        // If your token is divisible to 8 decimal places, 42 = 0.00000042 of your token
        var transferAmount = 1;

        // I chose gas price and gas limit based on what ethereum wallet was recommending for a similar transaction. You may need to change the gas price!
        var rawTransaction = {
            "from": myAddress,
            "nonce": "0x" + count.toString(16),
            "gasPrice": "0x003B9ACA00",
            "gasLimit": "0x250CA",
            "to": contractAddress,
            "value": "0x0",
            "data": contract.methods.transfer(destAddress, transferAmount).encodeABI(),
            "chainId": 0x01
        };

        // Example private key (do not use): 'e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109'
        // The private key must be for myAddress
        var privKey = new Buffer(my_privkey, 'hex');
        var tx = new Tx(rawTransaction);
        tx.sign(privKey);
        var serializedTx = tx.serialize();

        // Comment out these three lines if you don't really want to send the TX right now
        console.log(`Attempting to send signed tx:  ${serializedTx.toString('hex')}`);
        var receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
        console.log(`Receipt info:  ${JSON.stringify(receipt, null, '\t')}`);

        // The balance may not be updated yet, but let's check
        balance = await contract.methods.balanceOf(myAddress).call();
        console.log(`Balance after send: ${balance}`);*/
    }
}