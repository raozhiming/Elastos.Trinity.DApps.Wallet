import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { JoinvotelistPage } from './joinvotelist';

@NgModule({
  declarations: [
    JoinvotelistPage,
  ],
  imports: [
    IonicPageModule.forChild(JoinvotelistPage),
    TranslateModule.forChild()
  ],
})
export class JoinvotelistPageModule {}
