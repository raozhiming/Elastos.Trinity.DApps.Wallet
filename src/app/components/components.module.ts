import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderBarComponent } from './header-bar/header-bar.component';
import { MyToggleComponent } from './my-toggle/my-toggle.component';
import { MyQrcodeComponent } from './my-qrcode/my-qrcode.component';

@NgModule({
  declarations: [HeaderBarComponent, MyToggleComponent, MyQrcodeComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QRCodeModule,
    TranslateModule,
  ],
  exports: [HeaderBarComponent, MyToggleComponent, MyQrcodeComponent],
  providers: [
  ],
  entryComponents: [],
})
export class ComponentsModule { }
