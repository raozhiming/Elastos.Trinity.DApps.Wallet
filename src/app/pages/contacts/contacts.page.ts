import { Component, OnInit } from '@angular/core';
import { NavController, Events } from '@ionic/angular';
import { Native } from '../../services/Native';
import { PopupProvider } from '../../services/popup';
import { LocalStorage } from '../../services/Localstorage';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage implements OnInit {
  contactUser = {};
  qrcode: string = null;
  masterId:string ="1";
  isShow:boolean = false;
  params:any = {};
  constructor(public navCtrl: NavController, public route: ActivatedRoute, public native: Native,public localStorage:LocalStorage,public events:Events,public popupProvider:PopupProvider) {
    this.route.queryParams.subscribe((data)=>{
      this.params = data || {};
    });
    this.isShow = this.params["exatOption"]["hideButton"] || false;
    this.init();
  }

  ngOnInit() {
  }

  init() {
    this.localStorage.get('contactUsers').then((val)=>{
      if(val){
        let id = this.params["id"];
        this.contactUser = JSON.parse(val)[id];
        this.qrcode = this.contactUser["address"].toString();
      }
    });
  }

  rightHeader(): void {
    this.popupProvider.ionicConfirm("confirmTitle","text-delete-contact-confirm").then((data)=>{
      if(data){
        this.localStorage.get('contactUsers').then((val)=>{
          let contactUsers = JSON.parse(val);
          delete(contactUsers[this.contactUser["id"]]);
          this.localStorage.set('contactUsers', contactUsers);
          this.events.publish("contanctList:update");
          this.navCtrl.pop();
        });
      }
    });
  }

  pay(address): void {
    this.native.Go(this.navCtrl, "/transfer", {addr:this.contactUser['address']});
    this.events.publish("address:update",address);
    // this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length()-3));
  }
}

