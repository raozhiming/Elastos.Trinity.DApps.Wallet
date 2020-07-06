import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

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

    public setMasterInfos(obj) {
        let key = "infos";
        this.storage.set(key, JSON.stringify(obj));
    }

    public async getMasterInfos(): Promise<any> {
        return await this.get("infos");
    }

    public savePublishTxList(obj) {
        let key = "publishTx";
        this.storage.set(key, JSON.stringify(obj));
    }

    public async getPublishTxList(): Promise<any> {
        return await this.get("publishTx");
    }
}


