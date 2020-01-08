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

    public set(key: string, value: any): any {
        return this.storage.set(key, JSON.stringify(value));
    }

    public get(key: string): Promise<any> {
        return this.storage.get(key);
    }

    public getVal(key, func) {
        this.storage.get(key).then((val) => {
            if (typeof(val) == "string") {
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

    public addKyc(key: string, value: any): any {
        return this.storage.set(key, JSON.stringify(value));
    }

    public getKycList(func): any {
        let key = "kycId";
        this.getVal(key, func);
    }

    public saveCurMasterId(value) {
        // {masterId:"123"}
        let key = "cur-masterId";
        return this.storage.set(key, JSON.stringify(value));
    }

    public getCurMasterId(func) {
        let key = "cur-masterId";
        this.getVal(key, func);
    }

    public saveMappingTable(obj) {
        let key = "map-table";
        return this.add(key, obj);
    }

    public setMasterInfos(obj) {
        let key = "infos";
        this.storage.set(key, JSON.stringify(obj));
    }

    public getMasterInfos(func) {
        let key = "infos";
        this.getVal(key, func);
    }

    public setProgress(obj) {
        let key = "progress";
        this.storage.set(key, JSON.stringify(obj));
    }

    public getProgress(func) {
        let key = "progress";
        this.getVal(key, func);
    }

    public savePublishTxList(obj) {
        let key = "publishTx";
        this.storage.set(key, JSON.stringify(obj));
    }

    public getPublishTxList(func) {
        let key = "publishTx";
        this.getVal(key, func);
    }

}


