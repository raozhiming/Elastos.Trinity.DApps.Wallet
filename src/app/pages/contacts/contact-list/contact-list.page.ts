import { Component, OnInit } from '@angular/core';
import { NavController, Events } from '@ionic/angular';
import { WalletManager } from '../../../services/WalletManager';
import { Native } from '../../../services/Native';
import { ActivatedRoute } from '@angular/router';
import { LocalStorage } from '../../../services/Localstorage';
import { Util } from "../../../services/Util";

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.page.html',
  styleUrls: ['./contact-list.page.scss'],
})
export class ContactListPage implements OnInit {
  isnodata:boolean = false;
  contactUsers = [];
  params:any = {};
  constructor(public navCtrl: NavController, public route: ActivatedRoute, public walletManager: WalletManager,public native: Native,public localStorage:LocalStorage,public events :Events) {
        this.init();
  }
  ngOnInit() {
  }

  init() {
    this.route.queryParams.subscribe((data)=>{
      this.params = data || {};
    });
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
    this.native.Go(this.navCtrl, "/contact-create");
  }

  onclick(id): void {
    this.native.Go(this.navCtrl, "/contacts", {id: id,"exatOption":this.params});
  }

  ionViewDidLeave() {
    //this.events.unsubscribe("contanctList:update");
 }

}

