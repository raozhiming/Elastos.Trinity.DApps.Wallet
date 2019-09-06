import { Component, OnInit } from '@angular/core';
import { Util } from '../../services/Util';
import { Native } from '../../services/Native';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-importprivatekey',
  templateUrl: './importprivatekey.page.html',
  styleUrls: ['./importprivatekey.page.scss'],
})
export class ImportprivatekeyPage implements OnInit {

  public msobj:any;
  public importText:string="";
  public passWord:string="";
  public rePassword:string="";
  public name:string ="";
  constructor(public route: ActivatedRoute, public native: Native) {
    this.route.queryParams.subscribe((data)=>{
      this.msobj = data;
    });
  }

  ngOnInit() {
  }

  import(){
    if(this.checkParms()){
        this.msobj["importText"] = this.importText.replace(/^\s+|\s+$/g,"");
        this.msobj["passWord"] = this.passWord;
        this.msobj["name"] = this.name;
        this.native.go("/mpublickey", this.msobj);
    }
  }
  checkParms(){
    if (Util.isNull(this.name)) {
      this.native.toast_trans("text-wallet-name-validator");
      return;
    }

    if(Util.isWalletName(this.name)){
      this.native.toast_trans("text-wallet-name-validator1");
      return;
    }

    if(Util.isWallNameExit(this.name)){
      this.native.toast_trans("text-wallet-name-validator2");
      return;
    }

    if(Util.isNull(this.importText)){
      this.native.toast_trans('text-import-privatekey-placeholder');
      return false;
    }
    if(Util.isNull(this.passWord)){
      this.native.toast_trans('text-pay-password');
      return false;
    }

    if(this.passWord!=this.rePassword){
      this.native.toast_trans('text-passworld-compare');
      return false;
    }
    return true;
  }
}
