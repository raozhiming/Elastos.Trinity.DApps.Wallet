import { Injectable } from '@angular/core';
import { createHash } from 'crypto-js';
import { Util } from './Util';

@Injectable()
export class IDManager {
    constructor() {
    }

    public static hash(msg) {
        return createHash('sha256').update(msg).digest('hex');
    }

    //checksum计算规则
    public static getCheckSum(obj, sort) {
        let keys = IDManager.getObjKeys(obj, sort);
        let msg = "";
        for (let index in keys) {
            msg = msg + obj[keys[index]];
        }
        return this.hash(msg);
    }

    public static getObjKeys(obj, sort = "") {
        let arr = [];
        for (let key in obj) {
            if (!Util.isNull(obj[key])) {
                arr.push(key);
            }
        }

        if (sort === "asc") {
            IDManager.asc(arr);
        } else if (sort === "des") {
            IDManager.des(arr);
        }
        return arr;
    }

    /**
     * 从小到大
     */
    public static asc(keys) {
        keys.sort(function (s1, s2) {
            let x1 = s1.toUpperCase();
            let x2 = s2.toUpperCase();
            if (x1 < x2) {
                return -1;
            }
            if (x1 > x2) {
                return 1;
            }
            return 0;
        });
    }

    /**
    * 从大到小
    */
    public static des(keys) {
        keys.sort(function (s1, s2) {
            let x1 = s1.toUpperCase();
            let x2 = s2.toUpperCase();
            if (x1 > x2) {
                return -1;
            }
            if (x1 < x2) {
                return 1;
            }
            return 0;
        });
    }

}





