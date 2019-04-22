import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { LockdetailsPage } from './lockdetails';

@NgModule({
  declarations: [
    LockdetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(LockdetailsPage),
    TranslateModule.forChild()
  ]
})
export class LockdetailsPageModule {}
