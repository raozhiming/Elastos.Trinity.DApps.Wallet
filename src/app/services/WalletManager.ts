/*
 * Copyright (c) 2019 Elastos Foundation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Injectable, NgZone } from '@angular/core';
import { Native } from "./Native";
import { Config } from "./Config";
import { PopupProvider } from "./popup";
import { LocalStorage } from './Localstorage';
import { Events } from '@ionic/angular';

declare let walletManager: WalletPlugin.WalletManager;

/***
 * wallet jni 交互
 *
 * WalletManager.ts -> Wallet.js -> wallet.java -> WalletManager.java
 */
@Injectable()
export class WalletManager {

    private walletManager: WalletPlugin.WalletManager;
    public static COINTYPE_ELA = 0;
    public static COINTYPE_ID = 1;
    public static LIMITGAP = 500;
    public static FEEPERKb = 500;
    public static PAGECOUNT = 20;

    public masterWallet: any = {};
    public curMasterId: string = "-1";
    public curMaster: any = {};
    public walletInfos: any = {};
    public walletObjs: any = {};

    constructor(public native: Native,
        public event: Events,
        public localStorage: LocalStorage,
        public zone: NgZone,
        public popupProvider: PopupProvider) {

    }

    init() {
        this.walletManager = walletManager;
    }

    getTimestamp(): number {
        var timestamp = (new Date()).valueOf();
        return timestamp;
    }

    //--------------------------------------------------------------------------------子钱包操作


    /***
     * 创建子钱包
     * @param {string} masterWalletId
     * @param {string} chainID
     * @param {long} feePerKb
     */
    createSubWallet(masterWalletId: string, chainID: string, feePerKb: number, success, error = null) {
        this.walletManager.createSubWallet([masterWalletId, chainID, feePerKb],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err, error); });
    }

    /***
     * 恢复子钱包
     * @param {string} masterWalletId
     * @param {string} chainID
     * @param {int} limitGap
     * @param {long} feePerKb
     */
    recoverSubWallet(masterWalletId: string, chainID: string, limitGap: number, feePerKb: number, success) {
        this.walletManager.recoverSubWallet([masterWalletId, chainID, limitGap, feePerKb],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }


    //----------------------------------------------------------------------- 主钱包操作

    /**
     * 创建主钱包
     * @param {string} masterWalletId
     * @param {string} mnemonic
     * @param {string} phrasePassword
     * @param {string} payPassword
     * @param {boolean} singleAddress
     * @param Fun
     */
    createMasterWallet(masterWalletId: string, mnemonic: string, phrasePassword: string, payPassword: string, singleAddress: boolean, success) {
        this.walletManager.createMasterWallet([masterWalletId, mnemonic, phrasePassword, payPassword, singleAddress],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }
    /**
     * @param {string} masterWalletId
     * @param {string} keystoreContent
     * @param {string} backupPassword
     * @param {string} payPassword
     * @param Fun
     */
    importWalletWithKeystore(masterWalletId: string, keystoreContent: string, backupPassword: string, payPassword: string, success) {
        this.walletManager.importWalletWithKeystore([masterWalletId, keystoreContent, backupPassword, payPassword],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    /**
    * @param {string} masterWalletId
    * @param {string} mnemonic
    * @param {string} phrasePassword
    * @param {string} payPassword
    * @param {string} singleAddress
    * @param Fun
    */
    importWalletWithMnemonic(masterWalletId: string, mnemonic: string, phrasePassword: string, payPassword, singleAddress: boolean, success) {
        this.walletManager.importWalletWithMnemonic([masterWalletId, mnemonic, phrasePassword, payPassword, singleAddress],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    /**
     * @param {string} masterWalletId
     * @param {string} backupPassWord
     * @param {string} payPassword
     * @param Fun
     */
    exportWalletWithKeystore(masterWalletId: string, backupPassWord: string, payPassword: string, success) {
        this.walletManager.exportWalletWithKeystore([masterWalletId, backupPassWord, payPassword],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }
    /**
     * @param {string} masterWalletId
     * @param {string} payPassWord
     * @param Fun
     */
    exportWalletWithMnemonic(masterWalletId: string, payPassWord: string, success) {
        this.walletManager.exportWalletWithMnemonic([masterWalletId, payPassWord],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }
    /**
    * @param {string} masterWalletId
    * @param {string} chainId
    * @param {number} BalanceType
    * @param Fun
    */
    getBalance(masterWalletId: string, chainId: string, balanceType: number, success) {
        this.walletManager.getBalance([masterWalletId, chainId, balanceType],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }
    /**
    * @param {string} masterWalletId
    * @param {string} chainId
    * @param Fun
    */
    createAddress(masterWalletId: string, chainId: string, success) {
        this.walletManager.createAddress([masterWalletId, chainId],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    /**
     * @param {string} masterWalletId
     * @param {string} chainId
     * @param {string} start
     * @param Fun
     */
    getAllAddress(masterWalletId: string, chainId: string, start: number, success) {
        this.walletManager.getAllAddress([masterWalletId, chainId, start, 20],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    /**
    * @param {string} masterWalletId
    * @param {string} chainId
    * @param {string} address
    * @param Fun
    */
    getBalanceWithAddress(masterWalletId: string, chainId: string, address: string, balanceType, success) {
        this.walletManager.getBalanceWithAddress([masterWalletId, chainId, address, balanceType],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    /**
     * @param {string} masterWalletId
     * @param {string} chainId
     * @param {string} start
     * @param {string} addressOrTxId
     * @param Fun
     */
    getAllTransaction(masterWalletId: string, chainId: string, start, addressOrTxId, success) {
        this.walletManager.getAllTransaction([masterWalletId, chainId, start, WalletManager.PAGECOUNT, addressOrTxId],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }
    /**
    * @param {string} masterWalletId
    * @param {string} chainId
    * @param Fun
    */
    registerWalletListener(masterWalletId: string, chainId: string, success) {
        this.walletManager.registerWalletListener([masterWalletId, chainId],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    /**
     * @param {string} masterWalletId
     * @param {string} chainId
     * @param {string} message
     * @param {string} payPassword
     * @param Fun
     */
    sign(masterWalletId: string, chainId: string, message, payPassword, success) {
        this.walletManager.sign([masterWalletId, chainId, message, payPassword],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }
    /**
    * @param {string} masterWalletId
    * @param {string} chainId
    * @param {string} publicKey
    * @param {} message
    * @param {} signature
    * @param Fun
    */
    checkSign(masterWalletId: string, chainId: string, publicKey, message, signature, success) {
        this.walletManager.checkSign([masterWalletId, chainId, publicKey, message, signature],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }
    /**
     * @param {string} masterWalletId
     */
    destroyWallet(masterWalletId: string, success) {
        this.walletManager.destroyWallet([masterWalletId],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    deriveIdAndKeyForPurpose(purpose: number, index: number, payPassword: string, success) {
        this.walletManager.deriveIdAndKeyForPurpose([purpose, index, payPassword],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    getAllMasterWallets(success, error) {
        this.walletManager.getAllMasterWallets([],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err, error); });
    }
    /**
    * @param {string} masterWalletId
    */
    getBalanceInfo(masterWalletId: string, chainId: string, success) {
        this.walletManager.getBalanceInfo([masterWalletId, chainId],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }
    /**
     * @param {string} masterWalletId
     */
    isAddressValid(masterWalletId: string, address: string, success, error) {
        this.walletManager.isAddressValid([masterWalletId, address],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err, error); });
    }

    generateMnemonic(language: string, success) {
        this.walletManager.generateMnemonic([language],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    getAllChainIds(success) {
        this.walletManager.getAllChainIds([],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    /**
     * @param {string} masterWalletId
     */
    getSupportedChains(masterWalletId: string, success) {
        this.walletManager.getSupportedChains([masterWalletId],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }
    /**
     * @param {string} masterWalletId
     */
    getAllSubWallets(masterWalletId: string, success = null) {
        this.walletManager.getAllSubWallets([masterWalletId],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }
    /**
     * @param {string} masterWalletId
     */
    changePassword(masterWalletId: string, oldPassword: string, newPassword: string, success) {
        this.walletManager.changePassword([masterWalletId, oldPassword, newPassword],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    createTransaction(masterWalletId: string, chainId: string, fromAddress: string, toAddress: string, amount: number, memo: string, useVotedUTXO: boolean, success) {
        this.walletManager.createTransaction([masterWalletId, chainId, fromAddress, toAddress, amount, memo, useVotedUTXO],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    /*calculateTransactionFee(masterWalletId: string, chainId: string, rawTransaction: string, feePerKb: number, success) {
        this.walletManager.calculateTransactionFee([masterWalletId, chainId, rawTransaction, feePerKb],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }*/

    createIdTransaction(masterWalletId: string, chainId: string, fromAddress: string, payloadJson: string, programJson: string, memo: string, success) {
        this.walletManager.createIdTransaction([masterWalletId, chainId, fromAddress, payloadJson, programJson, memo],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    createDepositTransaction(masterWalletId: string, chainId: string, fromAddress: string, toAddress: string, amount: number
        , sidechainAccounts: string, memo: string, useVotedUTXO: boolean, success) {
        this.walletManager.createDepositTransaction([masterWalletId, chainId, fromAddress, toAddress, amount, sidechainAccounts, memo, useVotedUTXO],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    createWithdrawTransaction(masterWalletId: string, chainId: string, fromAddress: string, amount: number
        , mainchainAccounts: string, memo: string, success) {
        this.walletManager.createWithdrawTransaction([masterWalletId, chainId, fromAddress, amount, mainchainAccounts, memo],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    getGenesisAddress(masterWalletId: string, chainId: string, success) {
        this.walletManager.getGenesisAddress([masterWalletId, chainId],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    didGenerateProgram(did: string, message: string, password: string, success) {
        this.walletManager.didGenerateProgram([did, message, password],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    /**
      * @param {string} masterWalletId
      */
    getMasterWalletBasicInfo(masterWalletId: string, success) {
        this.walletManager.getMasterWalletBasicInfo([masterWalletId],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    createMultiSignMasterWallet(masterWalletId: string, publicKeys: string, m: number, success) {
        this.walletManager.createMultiSignMasterWallet([masterWalletId, publicKeys, m, this.getTimestamp()],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    createMultiSignMasterWalletWithPrivKey(masterWalletId: string, privKey: string, payPassword: string, publicKeys: string, m: number, success) {
        this.walletManager.createMultiSignMasterWalletWithPrivKey([masterWalletId, privKey, payPassword, publicKeys, m, this.getTimestamp()],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    /*updateTransactionFee(masterWalletId: string, chainId: string, rawTransaction: string, fee: number, fromAddress: string, success) {
        this.walletManager.updateTransactionFee([masterWalletId, chainId, rawTransaction, fee, fromAddress],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }*/

    signTransaction(masterWalletId: string, chainId: string, rawTransaction: string, payPassword: string, success) {
        this.walletManager.signTransaction([masterWalletId, chainId, rawTransaction, payPassword],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    publishTransaction(masterWalletId: string, chainId: string, rawTransaction: string, success) {
        this.walletManager.publishTransaction([masterWalletId, chainId, rawTransaction],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    getMasterWalletPublicKey(masterWalletId: string, success) {
        this.walletManager.getMasterWalletPublicKey([masterWalletId],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    getSubWalletPublicKey(masterWalletId: string, chainId: string, success) {
        this.walletManager.getSubWalletPublicKey([masterWalletId, chainId],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    createMultiSignMasterWalletWithMnemonic(masterWalletId: string, mnemonic: string, phrasePassword: string, payPassword: string, coSignersJson: string, requiredSignCount: string, success) {
        this.walletManager.createMultiSignMasterWalletWithMnemonic([masterWalletId, mnemonic, phrasePassword, payPassword, coSignersJson, requiredSignCount],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    removeWalletListener(masterWalletId: string, chainId: string, success) {
        this.walletManager.removeWalletListener([masterWalletId, chainId],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    disposeNative(success) {
        this.walletManager.disposeNative([],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }
    // args[0]: String mnemonic
    // args[1]: String phrasePassword
    getMultiSignPubKeyWithMnemonic(mnemonic, phrasePassword, success) {
        this.walletManager.getMultiSignPubKeyWithMnemonic([mnemonic, phrasePassword],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }
    // args[0]: String privKey
    getMultiSignPubKeyWithPrivKey(privKey, success) {
        this.walletManager.getMultiSignPubKeyWithPrivKey([privKey],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    getTransactionSignedSigners(masterWalletId: string, chainId: string, txJson: string, success) {
        this.walletManager.getTransactionSignedSigners([masterWalletId, chainId, txJson],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    /**
    * @param {string} masterWalletId
    * @param {string} keystoreContent
    * @param {string} backupPassword
    * @param {string} payPassword
    * @param {string} phrasePassword
    * @param Fun
    */
    importWalletWithOldKeystore(masterWalletId: string, keystoreContent: string, backupPassword: string, payPassword: string, phrasePassword: string, success) {
        this.walletManager.importWalletWithOldKeystore([masterWalletId, keystoreContent, backupPassword, payPassword, phrasePassword],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    getVersion(success) {
        this.walletManager.getVersion([],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }
    /**
    * @param {string} masterWalletId
    * @param {string} chainId
    * @param Fun
    */
    destroySubWallet(masterWalletId: string, chainId: string, success) {
        this.walletManager.destroySubWallet([masterWalletId, chainId],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    createCancelProducerTransaction(masterWalletId: string, chainId: string, fromAddress: string, payloadJson: string, memo: string, useVotedUTXO: boolean, success) {
        this.walletManager.createCancelProducerTransaction([masterWalletId, chainId, fromAddress, payloadJson, memo, useVotedUTXO],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    createVoteProducerTransaction(masterWalletId: string, chainId: string, fromAddress: string, stake: number, publicKey: string, memo: string, useVotedUTXO: boolean, success) {
        this.walletManager.createVoteProducerTransaction([masterWalletId, chainId, fromAddress, stake, publicKey, memo, useVotedUTXO],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    getVotedProducerList(masterWalletId: string, chainId: string, success) {
        this.walletManager.getVotedProducerList([masterWalletId, chainId],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }


    getRegisteredProducerInfo(masterWalletId: string, chainId: string, success) {
        this.walletManager.getRegisteredProducerInfo([masterWalletId, chainId],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }


    createRegisterProducerTransaction(masterWalletId: string, chainId: string, fromAddress: string, payloadJson: string, amount: number, memo: string, useVotedUTXO: boolean, success) {
        this.walletManager.createRegisterProducerTransaction([masterWalletId, chainId, fromAddress, payloadJson, amount, memo, useVotedUTXO],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    generateProducerPayload(masterWalletId: string, chainId: string, publicKey: string, nodePublicKey: string, nickName: string, url: string, IPAddress: string, location: number, payPasswd: string, success) {
        this.walletManager.generateProducerPayload([masterWalletId, chainId, publicKey, nodePublicKey, nickName, url, IPAddress, location, payPasswd],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    generateCancelProducerPayload(masterWalletId: string, chainId: string, publicKey: string, payPasswd: string, success) {
        this.walletManager.generateCancelProducerPayload([masterWalletId, chainId, publicKey, payPasswd],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    getPublicKeyForVote(masterWalletId: string, chainId: string, success) {
        this.walletManager.getPublicKeyForVote([masterWalletId, chainId],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }


    createRetrieveDepositTransaction(masterWalletId: string, chainId: string, amount, memo: string, success) {
        this.walletManager.createRetrieveDepositTransaction([masterWalletId, chainId, amount, memo],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    /**
     * @param {string} masterWalletId
     * @param {string} chainId
     * @param {string} start
     * @param {string} addressOrTxId
     * @param Fun
     */
    getAllMyTransaction(masterWalletId: string, chainId: string, start, addressOrTxId, success) {
        this.walletManager.getAllTransaction([masterWalletId, chainId, start, -1, addressOrTxId],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    createUpdateProducerTransaction(masterWalletId: string, chainId: string, fromAddress: string, payloadJson: string, memo: string, useVotedUTXO: boolean, success) {
        this.walletManager.createUpdateProducerTransaction([masterWalletId, chainId, fromAddress, payloadJson, memo, useVotedUTXO],
            (ret) => { this.successFun(ret, success); },
            (err) => { this.errorFun(err); });
    }

    successFun(ret, okFun = null) {
        // this.native.hideLoading(); //TODO::
        // this.native.info(ret);
        if (okFun != null) {
            return okFun(ret);
        }
    }

    errorFun(err, errFun = null) {
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

        if (err["code"] === 20013) {
            let amount = err["Data"] / Config.SELA;
            this.popupProvider.ionicAlert_data('confirmTitle', error, amount);
        } else if (err["code"] === 20036) {
            //this.event.publish("error:update");
        } else {
            this.popupProvider.ionicAlert('confirmTitle', error);
        }
        //alert("错误信息：" + JSON.stringify(error));
        if (err["code"] === 20036) {
            this.event.publish("error:update", err);
        } else if (err["code"] === 20028) {
            this.event.publish("error:destroySubWallet");
        } else {
            this.event.publish("error:update");
        }

        if (errFun != null) {
            return errFun(err);
        }
    }


}


