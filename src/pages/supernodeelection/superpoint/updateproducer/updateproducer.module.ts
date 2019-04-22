import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { UpdateproducerPage } from './updateproducer';

@NgModule({
  declarations: [
    UpdateproducerPage,
  ],
  imports: [
    IonicPageModule.forChild(UpdateproducerPage),
    TranslateModule.forChild()
  ],
})
export class UpdateproducerPageModule {}
