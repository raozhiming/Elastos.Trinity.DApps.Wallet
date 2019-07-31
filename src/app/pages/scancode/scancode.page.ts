import { Component, OnInit, NgZone } from '@angular/core';
import { Platform} from '@ionic/angular';
import { Native } from '../../services/Native';
import { WalletManager } from '../../services/WalletManager'
import { Config } from '../../services/Config';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-scancode',
  templateUrl: './scancode.page.html',
  styleUrls: ['./scancode.page.scss'],
})
export class ScancodePage implements OnInit {
  public qrcode: string=null;
  public txHash:string ="";
  public toAddress:string="";
  public fee:any;
  public amount:any;
  public iwidth:string=null;
  constructor(public route: ActivatedRoute, public native: Native,public walletManager: WalletManager,public zone:NgZone,public plt:Platform) {
           this.iwidth = (this.plt.width()-10).toString();
           this.route.queryParams.subscribe((data)=>{
            let params = data;
            this.fee = params["tx"]["fee"];
            let  txObj  = params["tx"]["raw"];
            this.walletManager.decodeTransactionFromString(txObj,(raw)=>{
              if(raw["success"]){
                  this.native.info(raw);
                  this.txHash = JSON.parse(raw["success"])["TxHash"];
                  this.toAddress =JSON.parse(raw["success"])["Outputs"][0]["Address"];
                  this.amount = JSON.parse(raw["success"])["Outputs"][0]["Amount"]/Config.SELA;
              }
            });
            this.zone.run(()=>{
              this.qrcode = JSON.stringify(params);
            });
            this.native.info(data);
          });
  }

  ngOnInit() {
  }

}
