import { Injectable } from '@angular/core';
import { LocalStorage } from './storage.service';

export type Contact = {
  cryptoname: string;
  address: string;
};

@Injectable({
  providedIn: 'root'
})

export class ContactsService {

  public contacts: Contact[] = [];

  constructor(
    private storage: LocalStorage
  ) { }

  async init() {
    await this.getContacts();
  }

  setContacts() {
    this.storage.setContacts(this.contacts);
  }

  getContacts() {
    return new Promise((resolve, reject) => {
      this.storage.getContacts().then((contacts) => {
        console.log("Fetched stored contacts", contacts);
        if (contacts) {
          this.contacts = contacts;
        }
        resolve();
      });
    });
  }
}
