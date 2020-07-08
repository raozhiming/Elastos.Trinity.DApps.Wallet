import path from 'path'
//var fs = require('fs');
import Web3 from 'Web3'
//var Tx = require('ethereumjs-tx');
import { TrinitySDK } from "@elastosfoundation/trinity-dapp-sdk"
//import { TrinitySDK } from "../../../../../../../Elastos.Trinity.DAppSDK/dist"
 
import { MasterWallet } from './MasterWallet';
import { SubWallet, SerializedSubWallet } from './SubWallet';
import { CoinType, CoinID, Coin } from './Coin';

export class ERC20SubWallet extends SubWallet {
    constructor(masterWallet: MasterWallet, id: CoinID) {
        super(masterWallet, id, CoinType.ERC20);

        this.initialize();
    }

    private initialize() {
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
        // TODO: call to web3 to get user's balance for this ERC20 token.

        this.tempInitialTestToUseERC20Stuff();
    }

    async tempInitialTestToUseERC20Stuff() {
        let trinityWeb3Provider = new TrinitySDK.Ethereum.Web3.Providers.TrinityWeb3Provider();
        const web3 = new Web3(trinityWeb3Provider);

        // This code was written and tested using web3 version 1.0.0-beta.26
        console.log(`web3 version: ${web3.version}`)

        // Who holds the token now?
        var myAddress = "0x742d35cc6634c0532925a3b844bc454e4438f44e";

        // Determine the nonce
        var count = await web3.eth.getTransactionCount(myAddress);
        console.log(`num transactions so far: ${count}`);

        // This file is just JSON stolen from the contract page on etherscan.io under "Contract ABI"
        var abiArray = require("../../assets/ethereum/StandardErc20ABI.json") // JSON.parse(fs.readFileSync(path.resolve(__dirname, './tt3.json'), 'utf-8'));

        // This is the address of the contract which created the ERC20 token
        var contractAddress = "0xc4032babad2b76c39abec3c4e365611de78528ed";
        var contract = new web3.eth.Contract(abiArray, contractAddress, { from: myAddress });

        // How many tokens do I have before sending?
        var balance = await contract.methods.balanceOf(myAddress).call();
        console.log(`Balance before send: ${balance}`);
        
        /*
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