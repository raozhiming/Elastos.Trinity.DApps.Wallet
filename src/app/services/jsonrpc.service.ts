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
    async getBalanceByAddress(chainID: StandardCoinName, addressArray: string[]) {
        const paramArray = [];
        let index = 0;

        for (const address of addressArray) {
            const param = {
                method: 'getreceivedbyaddress',
                params: {
                    address
                },
                id: index.toString()
            };
            index++;
            paramArray.push(param);
        }

        const rpcApiUrl = this.getRPCApiUrl(chainID);
        if (rpcApiUrl.length === 0) {
            return;
        }

        let balanceOfSELA = 0;
        const resultArray = await this.httpRequest(rpcApiUrl, paramArray);
        for (const result of resultArray) {
            balanceOfSELA += parseFloat(result.result) * Config.SELA;
        }
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

    httpRequest(rpcApiUrl: string, param: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const httpOptions = {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                })
            };
            this.http.post(rpcApiUrl, JSON.stringify(param), httpOptions)
            .subscribe((res: any) => {
                if (res instanceof Array) {
                    resolve(res);
                } else {
                    resolve(res.result || '');
                }
            }, (err) => {
                reject(err);
                console.log('JsonRPCService httpRequest error:', err);
            });
        });
    }
}
