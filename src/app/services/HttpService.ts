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

import {Injectable} from '@angular/core';
// import 'rxjs/add/operator/toPromise';
import {Observable} from "rxjs";
import { from } from 'rxjs';
import {Http, Response, Headers, RequestOptions, URLSearchParams} from '@angular/http';
import {Util} from "./Util";
//import {Native} from "./Native"
//import {ApiUrl} from "./ApiUrl";


/***
 * 请求处理
 *
 * demo：
 *  this.httpService.getByAuth(url, {
      "newpid":"sss",
      "orid": "sss"
    }).toPromise().then(data => {

    }).catch(error => {

    });
 */
@Injectable()
export class HttpService {

  constructor(private http: Http) {


  }

  public getByAuth(url: string, paramMap?: any): Observable<Response> {
    //this.native.info(paramMap);
    let headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    });

    return from(
      this.http.get(url,
        new RequestOptions
        (
          {search:HttpService.buildURLSearchParams(paramMap),
          headers: headers}
        ))
        .toPromise().then(
          (result)=>{ return result;},
          (error) => { return error;}
          )
         );
    }

  public postByAuth(url: string, paramMap?: any): Observable<Response> {
    //this.native.info(paramMap);
    let headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'application/json;charset=utf-8',
    });
    return this.http.post(url, HttpService.buildURLSearchParams(paramMap).toString(), new RequestOptions({headers: headers}))
  }

  public static buildURLSearchParams(paramMap): URLSearchParams {
    let params = new URLSearchParams();
    for (let key in paramMap) {
      let val = paramMap[key];
      if (val instanceof Date) {
        val = Util.dateFormat(val, 'yyyy-MM-dd HH:mm:ss')
      }
      params.set(key, val);
    }
    //params.set('ajax', 'true');
    return params;
  }

}
