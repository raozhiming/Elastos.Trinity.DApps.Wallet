import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { IconpromptboxPage } from './iconpromptbox';

@NgModule({
  declarations: [
    IconpromptboxPage,
  ],
  imports: [
    IonicPageModule.forChild(IconpromptboxPage),
    TranslateModule.forChild()
  ],
})
export class IconpromptboxPageModule {}
