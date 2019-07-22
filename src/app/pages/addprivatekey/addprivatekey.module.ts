import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { QRCodeModule } from 'angularx-qrcode';
import { ComponentsModule } from '../../components/components.module';

import { IonicModule } from '@ionic/angular';

import { AddprivatekeyPage } from './addprivatekey.page';

const routes: Routes = [
  {
    path: '',
    component: AddprivatekeyPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QRCodeModule,
    TranslateModule,
    ComponentsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AddprivatekeyPage]
})
export class AddprivatekeyPageModule {}
