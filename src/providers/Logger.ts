import { Injectable} from '@angular/core';

import * as _ from 'lodash';

import {Config} from "../providers/Config"

/**
 * 日志控制
 */
@Injectable()
export class Logger {

  constructor() {

  }


  public static info(message): void {
    if(Config.isDebug){
      let msg = "elastos=="+ (_.isString(message) ? message : JSON.stringify(message));
      console.log(msg,'color:#e8c406');
    }
  }
}
