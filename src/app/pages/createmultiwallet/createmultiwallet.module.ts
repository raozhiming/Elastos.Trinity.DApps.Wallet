import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { IonicModule } from '@ionic/angular';

import { CreatemultiwalletPage } from './createmultiwallet.page';

const routes: Routes = [
  {
    path: '',
    component: CreatemultiwalletPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    RouterModule.forChild(routes)
  ],
  declarations: [CreatemultiwalletPage]
})
export class CreatemultiwalletPageModule {}
