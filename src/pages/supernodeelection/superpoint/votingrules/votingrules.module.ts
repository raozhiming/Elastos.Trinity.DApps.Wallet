import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { VotingrulesPage } from './votingrules';

@NgModule({
  declarations: [
    VotingrulesPage,
  ],
  imports: [
    IonicPageModule.forChild(VotingrulesPage),
    TranslateModule.forChild(),
  ],
})
export class VotingrulesPageModule {}
