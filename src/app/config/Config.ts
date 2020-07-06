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

import { Injectable } from '@angular/core';

@Injectable()
export class Config {
    public static isDebug = true;
    public static progressObj = {}; // TODO: MOVE...
    public static requestDapp: any;
    public static modifyId = "";    // TODO: ???
    public static initialized: boolean = false;
    public static needPromptTransfer2IDChain = false; // for now just show once atmost?

    public static UTXOThreshold = 500;
    public static needCheckUTXOCount = true;

    public static SELA = 100000000;
    //public static ELA = 'ELA';
    //public static IDCHAIN = 'IDChain';

    public static IDCHAIN_URL: String = 'https://idchain.elastos.org/';
    public static BLOCKCHAIN_URL: String = 'https://blockchain.elastos.org/';
    // public static BLOCKCHAIN_URL: String = 'https://blockchain-beta.elastos.org/';
    //public static BLOCKCHAIN_URL: String = 'https://blockchain-regtest.elastos.org/';

    public static uuid(len, radix) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        var uuid = [], i;
        radix = radix || chars.length;

        if (len) {
            // Compact form
            for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
        } else {
            // rfc4122, version 4 form
            var r;

            // rfc4122 requires these characters
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';

            // Fill in random data. At i==19 set the high bits of clock sequence as
            // per rfc4122, sec. 4.1.5
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random() * 16;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }

        return uuid.join('');
    }

    public static objtoarr(obj) {
        let arr = [];
        for (let key in obj) {
            arr.push(obj[key]);
        }
        return arr;
    }
}
