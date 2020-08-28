import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config } from '../config/Config';

declare let appManager: AppManagerPlugin.AppManager;

type JSONRPCResponse = {
    error: string;
    id: string;
    jsonrpc: string;
    result: string;
};

@Injectable({
    providedIn: 'root'
})
export class EthJsonRPCService {
    private ETHSCRPCApiUrl = 'http://api.elastos.io:21636';

    constructor(private http: HttpClient) {
    }

    init() {
        // appManager.getPreference('sidechain.eth.rpcapi', (rpcapi) => {
        //     this.ETHSCRPCApiUrl = rpcapi;
        // });
    }

    // getGasPrice
    async getGasPrice(id: string) {
        const param = {
            method: 'eth_gasPrice',
            params: [
            ],
            id
        };

        const result = await this.httpRequest(this.ETHSCRPCApiUrl, param);
        console.log(' debug: getGasPrice:', result);
    }

    // getGasEstimate
    async getGasEstimate(id: string) {
        const param = {
            method: 'eth_estimateGas',
            params: [
            ],
            id
        };

        const result = await this.httpRequest(this.ETHSCRPCApiUrl, param);
        console.log(' debug: getGasPrice:', result);
    }

    // getBalance
    async getBalanceByAddress(address: string, id) {
        const param = {
            method: 'eth_getBalance',
            params: [
                address, 'latest'
            ],
            id
        };

        const balance = await this.httpRequest(this.ETHSCRPCApiUrl, param);
        // const balance = "0x10a741a462780000";
        console.log(' debug: getBalanceByAddress:', balance);

        // TODO: SELA or wei
        const balanceOfSELA = parseInt(balance, 16) / 10000000000;
        console.log(' debug: getBalanceByAddress:', balanceOfSELA);
        return balanceOfSELA;
    }

    // submitTransaction

    // getLogs
    async getLogs(id: string) {
        const param = {
            method: 'eth_getLogs',
            params: [
            ],
            id
        };

        const result = await this.httpRequest(this.ETHSCRPCApiUrl, param);
        console.log(' debug: eth_getLogs:', result);
    }

    // getBlocks
    async getBlockNumber(id: string) {
        const param = {
            method: 'eth_blockNumber',
            params: [
            ],
            id
        };

        const result = await this.httpRequest(this.ETHSCRPCApiUrl, param);
        console.log(' debug: eth_blockNumber:', result);
    }

    // getTokens


    httpRequest(rpcApiUrl: string, param: any): Promise<string> {
        return new Promise((resolve, reject) => {
            const httpOptions = {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                })
            };
            this.http.post(rpcApiUrl, JSON.stringify(param), httpOptions)
            .subscribe(res => {
                const response = res as JSONRPCResponse;
                resolve(response.result);
            }, (err) => {
                reject(err);
                console.log('EthJsonRPCService httpRequest error:', err);
            });
        });
    }
}
