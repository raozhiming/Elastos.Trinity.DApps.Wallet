import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { VotemanagePage } from './votemanage';

@NgModule({
  declarations: [
    VotemanagePage,
  ],
  imports: [
    IonicPageModule.forChild(VotemanagePage),
    TranslateModule.forChild()
  ],
})
export class VotemanagePageModule {}
