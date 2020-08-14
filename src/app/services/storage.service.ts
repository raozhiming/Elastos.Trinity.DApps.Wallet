import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { WalletID, ExtendedWalletInfo } from '../model/MasterWallet';

/***
 * 封装存储操作
 */
@Injectable()
export class LocalStorage {
    constructor(private storage: Storage) { }

    public add(key: string, value: any): any {
        return this.get(key).then((val) => {
            let id = value['id'];
            if (val === null) {
                let initObj = {};
                initObj[id] = value;
                return this.storage.set(key, JSON.stringify(initObj));
            }
            let addObj = JSON.parse(val);
            addObj[id] = value;
            return this.storage.set(key, JSON.stringify(addObj));
        });
    }

    public set(key: string, value: any): Promise<any> {
        return this.storage.set(key, value);
    }

    public async get(key: string): Promise<any> {
        console.log('Fetching for ' + key + ' in local storage');
        let val = await this.storage.get(key);
        if (typeof(val) === "string") {
            val = JSON.parse(val);
        }
        return val;
    }

    public getVal(key, func) {
        this.storage.get(key).then((val) => {
            if (typeof(val) === "string") {
                val = JSON.parse(val);
            }
            func(val);
        });
    }

    public remove(key: string): any {
        return this.storage.remove(key);
    }

    public clear(): any {
        return this.storage.clear();
    }

    public saveCurMasterId(value) {
        let key = "cur-masterId";
        return this.storage.set(key, JSON.stringify(value));
    }

    public async getCurMasterId(): Promise<any> {
        return await this.get("cur-masterId");
    }

    public saveMappingTable(obj) {
        let key = "map-table";
        return this.add(key, obj);
    }

    /**
     * Additional wallet info that can't be saved in the SPV SDK, so we save it on the app side.
     * Ex: wallet name given by the user.
     */
    public setExtendedMasterWalletInfo(masterId: WalletID, extendedInfo: ExtendedWalletInfo): Promise<void> {
        let key = "extended-wallet-infos-"+masterId;
        return this.storage.set(key, JSON.stringify(extendedInfo));
    }

    public async getExtendedMasterWalletInfos(masterId: WalletID): Promise<ExtendedWalletInfo> {
        let key = "extended-wallet-infos-"+masterId;
        return await this.get(key);
    }

    public savePublishTxList(obj) {
        let key = "publishTx";
        this.storage.set(key, JSON.stringify(obj));
    }

    public async getPublishTxList(): Promise<any> {
        return await this.get("publishTx");
    }

    public setCurrency(value: string) {
        return this.storage.set("currency", JSON.stringify(value)).then((data) => {
          console.log('Currency stored', data);
        });
    }

    public getCurrency(): Promise<string> {
        return this.storage.get("currency").then((data) => {
          console.log('Found currency stored', data);
          return JSON.parse(data);
        });
    }

    public setPrice(symbol: string, price: number) {
        return this.storage.set(symbol, JSON.stringify(price)).then((data) => {
          console.log('Ela price stored', data);
        });
    }

    public getPrice(symbol: string): Promise<number> {
        return this.storage.get(symbol).then((data) => {
          console.log('Found Ela price stored', data);
          return JSON.parse(data);
        });
    }
}


