import { Component, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';
import { Native } from '../../services/Native';
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
    masterId: string = "1";
    isShow: boolean = false;
    params: any = {};
    constructor(public route: ActivatedRoute, public native: Native, public localStorage: LocalStorage, public events: Events) {
        this.route.queryParams.subscribe((data) => {
            this.params = data || {};
        });
        console.log(this.params);
        if (typeof this.params["exatOption"] == "string") {
            this.params["exatOption"] = JSON.parse(this.params["exatOption"]);
            this.isShow = this.params["exatOption"]["hideButton"] || false;
        }
        console.log(this.isShow);
        this.init();
    }

    ngOnInit() {
    }

    init() {
        this.localStorage.get('contactUsers').then((val) => {
            if (val) {
                let id = this.params["id"];
                this.contactUser = JSON.parse(val)[id];
                this.qrcode = this.contactUser["address"].toString();
            }
        });
    }

    // rightHeader(): void {
    //     this.popupProvider.ionicConfirm("confirmTitle", "text-delete-contact-confirm").then((data) => {
    //         if (data) {
    //             this.localStorage.get('contactUsers').then((val) => {
    //                 let contactUsers = JSON.parse(val);
    //                 delete (contactUsers[this.contactUser["id"]]);
    //                 this.localStorage.set('contactUsers', contactUsers);
    //                 this.events.publish("contanctList:update");
    //                 this.native.pop();
    //             });
    //         }
    //     });
    // }

    pay(address): void {
        this.native.go("/transfer", { addr: this.contactUser['address'] });
        this.events.publish("address:update", address);
        // this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length()-3));
    }
}

