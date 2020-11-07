import { Component, OnInit, NgZone } from '@angular/core';
import { ContactsService, Contact } from 'src/app/services/contacts.service';
import { ThemeService } from 'src/app/services/theme.service';
import { ModalController } from '@ionic/angular';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
})
export class ContactsComponent implements OnInit {

  constructor(
    public contactsService: ContactsService,
    public theme: ThemeService,
    public modalCtrl: ModalController,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
  }

  ionViewWillLeave() {
  }

  selectContact(contact: Contact) {
    this.modalCtrl.dismiss({
      contact: contact
    });
  }
}
