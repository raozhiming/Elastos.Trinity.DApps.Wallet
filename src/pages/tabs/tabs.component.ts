import { Component,ChangeDetectorRef,NgZone} from '@angular/core';
import { HomeComponent } from '../tabs/home/home.component';
import { MyComponent } from '../tabs/my/my.component';
@Component({
  templateUrl: 'tabs.component.html'
})
export class TabsComponent {

  homeRoot = HomeComponent;
  settingsRoot =  MyComponent;
  constructor(public zone:NgZone,public changeDetectorRef: ChangeDetectorRef,) {

  }

  changeTabs(){
     this.zone.run(()=>{
      this.changeDetectorRef.markForCheck();
      this.changeDetectorRef.detectChanges();
     });
  }
}
