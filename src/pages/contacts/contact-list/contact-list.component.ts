import { Component} from '@angular/core';
import {ContactCreateComponent} from "../contact-create/contact-create.component";
import {ContactsComponent} from "../contacts.component";
import { NavController, NavParams,Events} from 'ionic-angular';
import {WalletManager} from '../../../providers/WalletManager';
import {Native} from "../../../providers/Native";
import {LocalStorage} from "../../../providers/Localstorage";
import {Util} from "../../../providers/Util";

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
})
export class ContactListComponent {
  isnodata:boolean = false;
  contactUsers = [];
  params:any = {};
  constructor(public navCtrl: NavController,public navParams: NavParams, public walletManager: WalletManager,public native: Native,public localStorage:LocalStorage,public events :Events) {
        this.init();
  }

  init() {
    this.params = this.navParams.data || {};
    this.events.subscribe("contanctList:update",()=>{
      this.localStorage.get('contactUsers').then((val)=>{
        if (val) {
          if(Util.isEmptyObject(JSON.parse(val))){
                this.isnodata = true;
                return;
          }
          this.isnodata =false;
          this.contactUsers = Util.objtoarr(JSON.parse(val));
        }else{
            this.isnodata = true;
        }
      });
    });

    this.localStorage.get('contactUsers').then((val)=>{
      if (val) {
        if(Util.isEmptyObject(JSON.parse(val))){
          this.isnodata = true;
          return;
        }
        this.isnodata =false;
        this.contactUsers = Util.objtoarr(JSON.parse(val));
      }else{
        this.isnodata = true;
      }
    });
  }

  rightHeader(): void {
    this.native.Go(this.navCtrl,ContactCreateComponent);
  }

  onclick(id): void {
    this.native.Go(this.navCtrl,ContactsComponent,{id: id,"exatOption":this.params});
  }

  ionViewDidLeave() {
    //this.events.unsubscribe("contanctList:update");
 }

}
