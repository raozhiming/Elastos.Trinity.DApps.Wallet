import { Component, OnInit } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Events, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-splashscreen',
  templateUrl: './splashscreen.page.html',
  styleUrls: ['./splashscreen.page.scss'],
})
export class SplashscreenPage implements OnInit {

  constructor(public events: Events, public modalCtrl: ModalController, public splashScreen: SplashScreen) {}

    ngOnInit() {}

    ionViewDidEnter() {
        this.splashScreen.hide();
    }
}
