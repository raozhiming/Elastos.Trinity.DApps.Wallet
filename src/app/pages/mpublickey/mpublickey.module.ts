import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { QRCodeModule } from 'angularx-qrcode';
import { ComponentsModule } from '../../components/components.module';

import { IonicModule } from '@ionic/angular';

import { MpublickeyPage } from './mpublickey.page';

const routes: Routes = [
  {
    path: '',
    component: MpublickeyPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ComponentsModule,
    QRCodeModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MpublickeyPage]
})
export class MpublickeyPageModule {}
