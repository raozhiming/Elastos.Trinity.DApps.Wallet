import { Util } from './Util';
import { Native } from '../services/native.service';
import { Events } from '@ionic/angular';
import { PopupProvider } from '../services/popup.service';
import { Config } from '../config/Config';
import { StandardCoinName } from './MasterWallet';

declare let walletManager: WalletPlugin.WalletManager;

export type ELAAmountString = string; // string representation of an ELA amount (encoded like this in the wallet plugin)
export type TransactionID = string;
export type SignedTransaction = string;

export type AllUTXOs = {
    MaxCount: number
    // TODO: utxos
}

export type PublishedTransaction = {
    TxHash: string;
}

export enum TransactionStatus {
    CONFIRMED = 'Confirmed',
    PENDING = 'Pending',
    UNCONFIRMED = 'Unconfirmed'
}

export enum TransactionDirection {
    RECEIVED = "Received",
    SENT = "Sent",
    MOVED = "Moved",
    DEPOSIT = "Deposit"
}

export type Transaction = {
    Amount: number;
    Fee: number;
    ConfirmStatus: string;
    Direction: TransactionDirection;
    Height: number;
    Status: TransactionStatus;
    Timestamp: number;
    TxHash: string;
    Type: number;
    OutputPayload: string;
    Inputs: any; // TODO: type
    Outputs: any; // TODO: type
    Memo: string;
};

export type AllTransactions = {
    MaxCount: number,
    Transactions: Transaction[]
}

export type SPVWalletMessage = {
    MasterWalletID: string;
    ChainID: StandardCoinName;
    Action: string;
    txId: string;
    status: string;
    Progress: number;
    LastBlockTime: number;

    // TODO: Tx published only? Inherit?
    hash: string;
    result: string;
    Code: string;
    Reason: string;
}

export type TxPublishedResult = {
    Code: number;
    Reason: string;
}

export class SPVWalletPluginBridge {
    constructor(private native: Native, private event: Events, private popupProvider: PopupProvider) {
    }
    
    public generateMnemonic(language: string): Promise<string> {
        return new Promise((resolve, reject)=>{
            walletManager.generateMnemonic([language],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    createMasterWallet(masterWalletId: string, mnemonic: string, phrasePassword: string, payPassword: string, singleAddress: boolean): Promise<any> {
        return new Promise((resolve, reject)=>{
            walletManager.createMasterWallet([masterWalletId, mnemonic, phrasePassword, payPassword, singleAddress],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    createMultiSignMasterWallet(masterWalletId: string, publicKeys: string, m: number): Promise<any> {
        return new Promise((resolve, reject)=>{
            walletManager.createMultiSignMasterWallet([masterWalletId, publicKeys, m, Util.getTimestamp()],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    createMultiSignMasterWalletWithPrivKey(masterWalletId: string, privKey: string, payPassword: string, publicKeys: string, m: number): Promise<any> {
        return new Promise((resolve, reject)=>{
            walletManager.createMultiSignMasterWalletWithPrivKey([masterWalletId, privKey, payPassword, publicKeys, m, Util.getTimestamp()],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    createMultiSignMasterWalletWithMnemonic(masterWalletId: string, mnemonic: string, phrasePassword: string, payPassword: string, coSignersJson: string, requiredSignCount: string): Promise<any> {
        return new Promise((resolve, reject)=>{
            walletManager.createMultiSignMasterWalletWithMnemonic([masterWalletId, mnemonic, phrasePassword, payPassword, coSignersJson, requiredSignCount],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    importWalletWithKeystore(masterWalletId: string, keystoreContent: string, backupPassword: string, payPassword: string): Promise<any> {
        return new Promise((resolve, reject)=>{
            walletManager.importWalletWithKeystore([masterWalletId, keystoreContent, backupPassword, payPassword],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    importWalletWithMnemonic(masterWalletId: string, mnemonic: string, phrasePassword: string, payPassword, singleAddress: boolean): Promise<any> {
        return new Promise((resolve, reject)=>{
            walletManager.importWalletWithMnemonic([masterWalletId, mnemonic, phrasePassword, payPassword, singleAddress],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    getAllMasterWallets(): Promise<string[]> {
        return new Promise((resolve, reject)=>{
            console.log("Getting all master wallets");

            walletManager.getAllMasterWallets([],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    destroyWallet(masterWalletId: string): Promise<void> {
        return new Promise((resolve, reject)=>{
            walletManager.destroyWallet([masterWalletId],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    getVersion(): Promise<string> {
        return new Promise((resolve, reject)=>{
            walletManager.getVersion([],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    getMasterWalletBasicInfo(masterWalletId: string): Promise<any> {
        return new Promise((resolve, reject)=>{
            walletManager.getMasterWalletBasicInfo([masterWalletId],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    getAllSubWallets(masterWalletId: string): Promise<StandardCoinName[]> {
        return new Promise((resolve, reject)=>{
            walletManager.getAllSubWallets([masterWalletId],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    createSubWallet(masterWalletId: string, chainID: string): Promise<any> {
        return new Promise((resolve, reject)=>{
            walletManager.createSubWallet([masterWalletId, chainID],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    exportWalletWithKeystore(masterWalletId: string, backupPassWord: string, payPassword: string): Promise<any> {
        return new Promise((resolve, reject)=>{
            walletManager.exportWalletWithKeystore([masterWalletId, backupPassWord, payPassword],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    exportWalletWithMnemonic(masterWalletId: string, payPassWord: string): Promise<any> {
        return new Promise((resolve, reject)=>{
            walletManager.exportWalletWithMnemonic([masterWalletId, payPassWord],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    destroySubWallet(masterWalletId: string, chainId: string): Promise<any> {
        return new Promise((resolve, reject)=>{
            walletManager.destroySubWallet([masterWalletId, chainId],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    isAddressValid(masterWalletId: string, address: string): Promise<boolean> {
        return new Promise((resolve, reject)=>{
            walletManager.isAddressValid([masterWalletId, address],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    getSupportedChains(masterWalletId: string): Promise<string[]> {
        return new Promise((resolve, reject)=>{
            walletManager.getSupportedChains([masterWalletId],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    changePassword(masterWalletId: string, oldPassword: string, newPassword: string): Promise<void> {
        return new Promise((resolve, reject)=>{
            walletManager.changePassword([masterWalletId, oldPassword, newPassword],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    syncStart(masterWalletId: string, chainId: string): Promise<void> {
        return new Promise((resolve, reject)=>{
            walletManager.syncStart([masterWalletId, chainId],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    syncStop(masterWalletId: string, chainId: string): Promise<void> {
        return new Promise((resolve, reject)=>{
            walletManager.syncStop([masterWalletId, chainId],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    getBalanceInfo(masterWalletId: string, chainId: string): Promise<string> {
        return new Promise((resolve, reject)=>{
            walletManager.getBalanceInfo([masterWalletId, chainId],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    getBalance(masterWalletId: string, chainId: string): Promise<ELAAmountString> {
        return new Promise((resolve, reject)=>{
            walletManager.getBalance([masterWalletId, chainId],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    getBalanceWithAddress(masterWalletId: string, chainId: string, address: string, balanceType): Promise<ELAAmountString> {
        return new Promise((resolve, reject)=>{
            walletManager.getBalanceWithAddress([masterWalletId, chainId, address, balanceType],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    createAddress(masterWalletId: string, chainId: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.createAddress([masterWalletId, chainId],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    getAllAddresses(masterWalletId: string, chainId: string, start: number): Promise<string[]> {
        return new Promise(async (resolve, reject) => {
            walletManager.getAllAddress([masterWalletId, chainId, start, 20],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    getAllPublicKeys(masterWalletId: string, chainId: string, start: number, count: number): Promise<any> {
        return new Promise(async (resolve, reject) => {
            walletManager.getAllPublicKeys([masterWalletId, chainId, start, count],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    createTransaction(masterWalletId: string, chainId: string, fromAddress: string, toAddress: string, amount: string, memo: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            walletManager.createTransaction([masterWalletId, chainId, fromAddress, toAddress, amount, memo],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    getAllUTXOs(masterWalletId: string, chainId: string, start: number, count: number, address: string): Promise<AllUTXOs> {
        return new Promise(async (resolve, reject) => {
            walletManager.getAllUTXOs([masterWalletId, chainId, start, count, address],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    createConsolidateTransaction(masterWalletId: string, chainId: string, memo: string): Promise<TransactionID> {
        return new Promise(async (resolve, reject) => {
            walletManager.createConsolidateTransaction([masterWalletId, chainId, memo],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    signTransaction(masterWalletId: string, chainId: string, rawTransaction: string, payPassword: string): Promise<SignedTransaction> {
        return new Promise(async (resolve, reject) => {
            walletManager.signTransaction([masterWalletId, chainId, rawTransaction, payPassword],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    publishTransaction(masterWalletId: string, chainId: string, rawTransaction: string): Promise<PublishedTransaction> {
        return new Promise(async (resolve, reject) => {
            walletManager.publishTransaction([masterWalletId, chainId, rawTransaction],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    getAllTransactions(masterWalletId: string, chainId: string, start, addressOrTxId): Promise<AllTransactions> {
        return new Promise(async (resolve, reject) => {
            const maxNumberOfTransactionsToReturn = 20;
            walletManager.getAllTransaction([masterWalletId, chainId, start, maxNumberOfTransactionsToReturn, addressOrTxId],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    // TODO: Types for listener data
    registerWalletListener(masterWalletId: string, chainId: string, listener: (ret: SPVWalletMessage)=>void) {
        walletManager.registerWalletListener([masterWalletId, chainId],
            (ret) => { listener(ret); },
            (err) => { this.handleError(err, null);  });
    }

    removeWalletListener(masterWalletId: string, chainId: string) {
        walletManager.removeWalletListener([masterWalletId, chainId],
            (ret) => { },
            (err) => { this.handleError(err, null); });
    }

    createWithdrawTransaction(masterWalletId: string, chainId: string, fromAddress: string, amount: string
        , mainchainAccounts: string, memo: string): Promise<string> {
            return new Promise(async (resolve, reject) => {
            walletManager.createWithdrawTransaction([masterWalletId, chainId, fromAddress, amount, mainchainAccounts, memo],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    getGenesisAddress(masterWalletId: string, chainId: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.getGenesisAddress([masterWalletId, chainId],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    // IDChainSubWallet

    createIdTransaction(masterWalletId: string, chainId: string, payloadJson: string, memo: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.createIdTransaction([masterWalletId, chainId, payloadJson, memo],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    didSign(masterWalletId: string, did: string, message: string, payPassword: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.didSign([masterWalletId, did, message, payPassword],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    didSignDigest(masterWalletId: string, did: string, digest: string, payPassword: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.didSignDigest([masterWalletId, did, digest, payPassword],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    createDepositTransaction(masterWalletId: string, chainId: string, fromAddress: string, sideChainID: string, amount: string
        , sideChainAddress: string, memo: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.createDepositTransaction([masterWalletId, chainId, fromAddress, sideChainID, amount, sideChainAddress, memo],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    createCancelProducerTransaction(masterWalletId: string, chainId: string, fromAddress: string, payloadJson: string, memo: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.createCancelProducerTransaction([masterWalletId, chainId, fromAddress, payloadJson, memo],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    createVoteProducerTransaction(masterWalletId: string, chainId: string, fromAddress: string, stake: string, publicKey: string, memo: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.createVoteProducerTransaction([masterWalletId, chainId, fromAddress, stake, publicKey, memo],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    getVotedProducerList(masterWalletId: string, chainId: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            walletManager.getVotedProducerList([masterWalletId, chainId],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    getRegisteredProducerInfo(masterWalletId: string, chainId: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            walletManager.getRegisteredProducerInfo([masterWalletId, chainId],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    createRegisterProducerTransaction(masterWalletId: string, chainId: string, fromAddress: string, payloadJson: string, amount: number, memo: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.createRegisterProducerTransaction([masterWalletId, chainId, fromAddress, payloadJson, amount, memo],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    generateProducerPayload(masterWalletId: string, chainId: string, publicKey: string, nodePublicKey: string, nickname: string, url: string, IPAddress: string, location: number, payPasswd: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            walletManager.generateProducerPayload([masterWalletId, chainId, publicKey, nodePublicKey, nickname, url, IPAddress, location, payPasswd],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    generateCancelProducerPayload(masterWalletId: string, chainId: string, publicKey: string, payPasswd: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            walletManager.generateCancelProducerPayload([masterWalletId, chainId, publicKey, payPasswd],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    createRetrieveDepositTransaction(masterWalletId: string, chainId: string, amount, memo: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.createRetrieveDepositTransaction([masterWalletId, chainId, amount, memo],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    createUpdateProducerTransaction(masterWalletId: string, chainId: string, fromAddress: string, payloadJson: string, memo: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.createUpdateProducerTransaction([masterWalletId, chainId, fromAddress, payloadJson, memo],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    getOwnerPublicKey(masterWalletId: string, chainId: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.getOwnerPublicKey([masterWalletId, chainId],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    // CR
    generateCRInfoPayload(masterWalletId: string, chainId: string, publicKey: string,
        did: string, nickname: string, url: string, location: number): Promise<any> {
        return new Promise(async (resolve, reject) => {
            walletManager.generateCRInfoPayload([masterWalletId, chainId, publicKey, did, nickname, url, location],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    generateUnregisterCRPayload(masterWalletId: string, chainId: string, CID: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.generateUnregisterCRPayload([masterWalletId, chainId, CID],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    createRegisterCRTransaction(masterWalletId: string, chainId: string, fromAddress: string, payloadJson: string, amount: string, memo: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.createRegisterCRTransaction([masterWalletId, chainId, fromAddress, payloadJson, amount, memo],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    createUpdateCRTransaction(masterWalletId: string, chainId: string, fromAddress: string, payloadJson: string, memo: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.createUpdateCRTransaction([masterWalletId, chainId, fromAddress, payloadJson, memo],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    createUnregisterCRTransaction(masterWalletId: string, chainId: string, fromAddress: string, payloadJson: string, memo: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.createUnregisterCRTransaction([masterWalletId, chainId, fromAddress, payloadJson, memo],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    createRetrieveCRDepositTransaction(masterWalletId: string, chainId: string, publicKey: string, amount: string, memo: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.createRetrieveCRDepositTransaction([masterWalletId, chainId, publicKey, amount, memo],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    createVoteCRTransaction(masterWalletId: string, chainId: string, fromAddress: string, votes: string, memo: string, invalidCandidates: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.createVoteCRTransaction([masterWalletId, chainId, fromAddress, votes, memo, invalidCandidates],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    getVotedCRList(masterWalletId: string, chainId: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.getVotedCRList([masterWalletId, chainId],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    getRegisteredCRInfo(masterWalletId: string, chainId: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.getRegisteredCRInfo([masterWalletId, chainId],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    getVoteInfo(masterWalletId: string, chainId: string, type: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.getVoteInfo([masterWalletId, chainId, type],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    createVoteCRCProposalTransaction(masterWalletId: string, chainId: string, fromAddress: string, votes: string, memo: string,
        invalidCandidates: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.createVoteCRCProposalTransaction([masterWalletId, chainId, fromAddress, votes, memo, invalidCandidates],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    createImpeachmentCRCTransaction(masterWalletId: string, chainId: string, fromAddress: string, votes: string, memo: string,
        invalidCandidates: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.createImpeachmentCRCTransaction([masterWalletId, chainId, fromAddress, votes, memo, invalidCandidates],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    // CR proposal

    proposalOwnerDigest(masterWalletId: string, chainId: string, payload: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.proposalOwnerDigest([masterWalletId, chainId, payload],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    proposalCRCouncilMemberDigest(masterWalletId: string, chainId: string, payload: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.proposalCRCouncilMemberDigest([masterWalletId, chainId, payload],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    createProposalTransaction(masterWalletId: string, chainId: string, payload: string, memo: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.createProposalTransaction([masterWalletId, chainId, payload, memo],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    proposalReviewDigest(masterWalletId: string, chainId: string, payload: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.proposalReviewDigest([masterWalletId, chainId, payload],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    createProposalReviewTransaction(masterWalletId: string, chainId: string, payload: string, memo: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.createProposalReviewTransaction([masterWalletId, chainId, payload, memo],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    proposalTrackingOwnerDigest(masterWalletId: string, chainId: string, payload: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.proposalTrackingOwnerDigest([masterWalletId, chainId, payload],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    proposalTrackingNewOwnerDigest(masterWalletId: string, chainId: string, payload: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.proposalTrackingNewOwnerDigest([masterWalletId, chainId, payload],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    proposalTrackingSecretaryDigest(masterWalletId: string, chainId: string, payload: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.proposalTrackingSecretaryDigest([masterWalletId, chainId, payload],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    createProposalTrackingTransaction(masterWalletId: string, chainId: string, SecretaryGeneralSignedPayload: string, memo: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.createProposalTrackingTransaction([masterWalletId, chainId, SecretaryGeneralSignedPayload, memo],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject);  });
        });
    }

    proposalWithdrawDigest(masterWalletId: string, chainId: string, payload: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.proposalWithdrawDigest([masterWalletId, chainId, payload],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject); reject(err); });
        });
    }

    createProposalWithdrawTransaction(masterWalletId: string, chainId: string, recipient: string, amount: string, utxo: string, payload: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            walletManager.createProposalWithdrawTransaction([masterWalletId, chainId, recipient, amount, utxo, payload],
                (ret) => { resolve(ret); },
                (err) => { this.handleError(err, reject); });
        });
    }

    successFun(ret, okFun = null) {
        if (okFun != null) {
            return okFun(ret);
        }
    }

    // TODO: Replace this to improve the error object (exception, message) only, not
    // show any popup or send message. Each method should handle that case by case
    // TODO: replace hardcoded error code with enum: http://elastos.ela.spv.cpp/SDK/Common/ErrorChecker.h
    handleError(err: any, promiseRejectHandler: (reason?: any)=>void): any {
        this.native.hideLoading();
        this.native.error(err);

        let error = err["code"]
        if (error) {
            error = "Error-" + err["code"];
            if (err["exception"]) {
                error = error + ": " + err["exception"];
            }
            else if (err["message"]) {
                error = error + ": " + err["message"];
            }
        }

        // Show an error popup
        if (err["code"] === 20013) {
            let amount = err["Data"] / Config.SELA;
            this.popupProvider.ionicAlert_data('transaction-fail', error, amount);
        } else {
            this.popupProvider.ionicAlert('transaction-fail', 'Error-' + err["code"]);
        }

        // Send a special error event
        if (err["code"] === 20036) {
            this.event.publish("error:update", err);
        } else if (err["code"] === 20028) {
            this.event.publish("error:destroySubWallet");
        } else {
            this.event.publish("error:update");
        }

        if (promiseRejectHandler)
            promiseRejectHandler(err);
    }
}