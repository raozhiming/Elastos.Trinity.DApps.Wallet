import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { NodeinformationPage } from './nodeinformation';

@NgModule({
  declarations: [
    NodeinformationPage,
  ],
  imports: [
    IonicPageModule.forChild(NodeinformationPage),
    TranslateModule.forChild()
  ],
})
export class NodeinformationPageModule {}
