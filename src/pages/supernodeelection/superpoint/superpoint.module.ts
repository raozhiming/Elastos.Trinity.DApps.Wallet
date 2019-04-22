import { NgModule } from '@angular/core';
import { IonicPageModule} from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { SuperpointPage } from './superpoint';

@NgModule({
  declarations: [
    SuperpointPage,
  ],
  imports: [
    IonicPageModule.forChild(SuperpointPage),
    TranslateModule.forChild(),
  ],
  exports: [
    SuperpointPage
  ]
})
export class SuperpointPageModule {}
