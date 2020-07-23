import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

declare let appManager: AppManagerPlugin.AppManager;
declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  public darkMode = false;
  public isAndroid = false;

  constructor(private platform: Platform) {
    this.platform.ready().then(() => {
      this.getTheme();
    });
  }

  getTheme() {
    if (this.platform.platforms().indexOf('android') === 0) {
      this.isAndroid = true;
    }

    appManager.getPreference("ui.darkmode", (value) => {
      this.darkMode = value;
      this.setTheme(this.darkMode);
    });
  }

  setTheme(dark) {
    this.darkMode = dark;
    if (!this.darkMode) {
      document.body.classList.remove("dark");
      titleBarManager.setForegroundMode(TitleBarPlugin.TitleBarForegroundMode.DARK);
      titleBarManager.setBackgroundColor("#f8f8ff");
    } else {
      document.body.classList.add("dark");
      titleBarManager.setForegroundMode(TitleBarPlugin.TitleBarForegroundMode.LIGHT);
      titleBarManager.setBackgroundColor("#191a2f");
    }
  }
}
