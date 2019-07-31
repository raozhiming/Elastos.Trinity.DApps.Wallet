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

/***
 * URL
 */
export  class ApiUrl {
  /**后台服务*/
  public static SERVER:string = 'https://39.106.96.168:8446/api';
   /**后台服务*/
  public static SERVER1:string = 'https://123.206.52.29/api';
  public static SERVER2:string = 'https://52.81.8.194:442/api';
  /**获取认证费用定价 */
  public static GET_PRICE:string = ApiUrl.SERVER +'/getPrice';
  public static SEND_CODE:string = ApiUrl.SERVER +'/sendCode';
  /**用户信息认证接口*/
  public static AUTH:string = ApiUrl.SERVER +'/authreqstatus/auth';
  /**APP认证结果请求接口 */
  public static APP_AUTH:string = ApiUrl.SERVER +'/app/auth';
  /**获取投票列表 */
  public static listproducer:string = ApiUrl.SERVER2 +'/dposnoderpc/check/listproducer';

  public static getdepositcoin:string =ApiUrl.SERVER2+'/dposnoderpc/check/getdepositcoin';
}
