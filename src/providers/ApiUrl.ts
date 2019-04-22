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
