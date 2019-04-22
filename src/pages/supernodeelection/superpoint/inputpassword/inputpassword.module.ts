import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { InputpasswordPage } from './inputpassword';

@NgModule({
  declarations: [
    InputpasswordPage,
  ],
  imports: [
    IonicPageModule.forChild(InputpasswordPage),
    TranslateModule.forChild()
  ],
})
export class InputpasswordPageModule {}
