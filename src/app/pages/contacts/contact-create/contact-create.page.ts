import { Component, OnInit } from '@angular/core';
import { Util } from "../../../services/Util";
import { Events } from '@ionic/angular';
import { WalletManager } from '../../../services/WalletManager';
import { Native } from '../../../services/Native';
import { ActivatedRoute } from '@angular/router';
import { LocalStorage } from '../../../services/Localstorage';
import { PopupProvider } from '../../../services/popup';

@Component({
    selector: 'app-contact-create',
    templateUrl: './contact-create.page.html',
    styleUrls: ['./contact-create.page.scss'],
})
export class ContactCreatePage implements OnInit {
    contactUser = {};
    id: String;
    name: String;
    address: String;
    phone: String;
    email: String;
    remark: String;
    isEdit: boolean = false;

    constructor(public route: ActivatedRoute, public walletManager: WalletManager,
        public native: Native,
        public localStorage: LocalStorage,
        public events: Events,
        public popupProvider: PopupProvider) {

        this.route.queryParams.subscribe((data) => {
            if (!Util.isEmptyObject(data)) {
                this.contactUser = data;
                this.id = data.id;
                this.name = data.name;
                this.address = data.address;
                this.phone = data.phone;
                this.email = data.email;
                this.remark = data.remark;
                this.isEdit = true;
            }
            else {
                this.id = Util.uuid();
                // console.log(this.id);
                this.name = "";
                this.address = "";
                this.phone = "";
                this.email = "";
            }
        });

    }

    ngOnInit() {
    }


    add(): void {
        let contactUsers = {
            id: this.id,
            name: this.name,
            address: this.address,
            phone: this.phone,
            email: this.email,
            remark: this.remark
        }
        if (Util.isNull(this.name)) {
            this.native.toast_trans("contact-name-notnull");
            return;
        }
        if (Util.isNull(this.address)) {
            this.native.toast_trans("contact-address-notnull");
            return;
        }
        if (!Util.isAddressValid(this.address)) {
            this.native.toast_trans("contact-address-digits");
            return;
        }
        if (this.phone && Util.checkCellphone(this.phone.toString())) {
            this.native.toast_trans("contact-phone-check");
            return;
        }
        this.localStorage.add('contactUsers', contactUsers).then((val) => {
            this.events.publish("contanctList:update");
            this.native.pop();
        });
    }

    modify() {
        this.add();
    }

    delete(): void {
        this.popupProvider.ionicConfirm("confirmTitle", "text-delete-contact-confirm").then((data) => {
            if (data) {
                this.localStorage.get('contactUsers').then((val) => {
                    let contactUsers = JSON.parse(val);
                    let id = this.id;
                    delete (contactUsers[this.contactUser["id"]]);
                    this.localStorage.set('contactUsers', JSON.stringify(contactUsers));
                    this.events.publish("contanctList:update");
                    this.native.pop();
                });
            }
        });
    }

}
