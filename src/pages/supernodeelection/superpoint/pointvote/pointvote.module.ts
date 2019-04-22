import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { PointvotePage } from './pointvote';
import {ComponentsModule} from "../../../../components/components.module";

@NgModule({
  declarations: [
    PointvotePage,
  ],
  imports: [
    IonicPageModule.forChild(PointvotePage),
    TranslateModule.forChild(),
    ComponentsModule
  ],
})
export class PointvotePageModule {}
