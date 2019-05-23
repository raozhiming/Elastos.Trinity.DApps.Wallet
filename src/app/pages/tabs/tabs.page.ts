import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
// import { HomeComponent } from '../tabs/home/home.component';
// import { MyComponent } from '../tabs/my/my.component';



@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {
  constructor(public zone:NgZone,public changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit() {
  }

  changeTabs(){
     this.zone.run(()=>{
      this.changeDetectorRef.markForCheck();
      this.changeDetectorRef.detectChanges();
     });
  }
}
