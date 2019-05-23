import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';


import { IonicModule } from '@ionic/angular';

import { LauncherPage } from './launcher.page';

const routes: Routes = [
  {
    path: '',
    component: LauncherPage
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
  declarations: [LauncherPage]
})
export class LauncherPageModule {}
