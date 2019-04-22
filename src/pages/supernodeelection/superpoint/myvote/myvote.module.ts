import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { MyvotePage } from './myvote';

@NgModule({
  declarations: [
    MyvotePage,
  ],
  imports: [
    IonicPageModule.forChild(MyvotePage),
    TranslateModule.forChild()
  ],
})
export class MyvotePageModule {}
