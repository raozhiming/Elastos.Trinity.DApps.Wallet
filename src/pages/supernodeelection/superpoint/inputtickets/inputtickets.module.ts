import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { InputticketsPage } from './inputtickets';

@NgModule({
  declarations: [
    InputticketsPage,
  ],
  imports: [
    IonicPageModule.forChild(InputticketsPage),
    TranslateModule.forChild()
  ],
})
export class InputticketsPageModule {}
