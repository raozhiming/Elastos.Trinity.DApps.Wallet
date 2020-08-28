import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StandardCoinName } from '../model/Coin';
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
export class JsonRPCService {
    private mainchainRPCApiUrl = 'http://api.elastos.io:20336';
    private IDChainRPCApiUrl = 'http://api.elastos.io:20606';

    constructor(private http: HttpClient) {
    }

    init() {
        appManager.getPreference('mainchain.rpcapi', (rpcapi) => {
            this.mainchainRPCApiUrl = rpcapi;
        });
        appManager.getPreference('sidechain.id.rpcapi', (rpcapi) => {
            this.IDChainRPCApiUrl = rpcapi;
        });
    }

    // return balance in SELA
    async getBalanceByAddress(chainID: StandardCoinName, address: string) {
        const param = {
            method: 'getreceivedbyaddress',
            params: {
                address
            }
        };

        const rpcApiUrl = this.getRPCApiUrl(chainID);
        if (rpcApiUrl.length === 0) {
            return;
        }

        const balance = await this.httpRequest(rpcApiUrl, param);
        const balanceOfSELA = parseFloat(balance) * Config.SELA;
        console.log(' debug: getBalanceByAddress:', balanceOfSELA);
        return Math.round(balanceOfSELA);
    }

    async getBlockHeight(chainID: StandardCoinName) {
        const param = {
            method: 'getblockcount',
        };

        const rpcApiUrl = this.getRPCApiUrl(chainID);
        if (rpcApiUrl.length === 0) {
            return;
        }

        const blockHeight  = await this.httpRequest(rpcApiUrl, param);
        return parseInt(blockHeight, 10);
    }

    getRPCApiUrl(chainID: string) {
        let rpcApiUrl = this.mainchainRPCApiUrl;
        switch (chainID) {
            case StandardCoinName.ELA:
                break;
            case StandardCoinName.IDChain:
                rpcApiUrl = this.IDChainRPCApiUrl;
                break;
            default:
                rpcApiUrl = '';
                console.log('JsonRPCService: Can not support ' + chainID);
                break;
        }
        return rpcApiUrl;
    }

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
                console.log('JsonRPCService httpRequest error:', err);
            });
        });
    }
}
