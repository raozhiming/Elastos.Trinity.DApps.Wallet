import { Component, OnInit } from '@angular/core';

declare let appManager: AppManagerPlugin.AppManager;

@Component({
  selector: 'app-splashscreen',
  templateUrl: './splashscreen.page.html',
  styleUrls: ['./splashscreen.page.scss'],
})
export class SplashscreenPage implements OnInit {

    constructor() {}

    ngOnInit() {
    }

    ionViewDidEnter() {
        appManager.setVisible("show", ()=>{}, (err)=>{});
    }
}
