import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, ModalController } from '@ionic/angular';
import { ThemeService } from './theme.service';
import { Native } from './native.service';
import { PaymentboxComponent } from '../components/paymentbox/paymentbox.component';

@Injectable()
export class PopupProvider {
  constructor(
    private alertCtrl: AlertController,
    private translate: TranslateService,
    private theme: ThemeService,
    private modalCtrl: ModalController,
    private native: Native
  ) {}

  public ionicAlert(title: string, subTitle?: string, okText?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.alertCtrl.create({
        header : this.translate.instant(title),
        subHeader : subTitle ? this.translate.instant(subTitle) : '',
        backdropDismiss: false,
        cssClass: 'my-custom-alert',
        buttons: [
          {
            text: okText ? okText : this.translate.instant('confirm'),
            handler: () => {
              console.log('ionicAlert Ok clicked');
              resolve();
            }
          }
        ]
      }).then(alert => alert.present());
    });
  };

  public ionicAlert_data(title: string, subTitle?: string,amount?:any,okText?: string): Promise<any> {
    let suggestAmount = this.translate.instant('suggest-amount');
    return new Promise((resolve, reject) => {
      this.alertCtrl.create({
        header : this.translate.instant(title),
        subHeader : this.translate.instant(subTitle)+"("+suggestAmount+amount+")",
        backdropDismiss: false,
        cssClass: 'my-custom-alert',
        buttons: [
          {
            text: okText ? okText : this.translate.instant('confirm'),
            handler: () => {
              console.log('ionicAlert_data Ok clicked');
              resolve();
            }
          }
        ]
      }).then(alert => alert.present());
    });
  };

  public ionicAlert_delTx(title: string, subTitle?: string,hash?:any,okText?: string): Promise<any> {
    let transactionDeleted = this.translate.instant('transaction-deleted');
    return new Promise((resolve, reject) => {
      this.alertCtrl.create({
        header : this.translate.instant(title),
        subHeader :"txHash:"+"("+hash+")"+":"+transactionDeleted,
        backdropDismiss: false,
        cssClass: 'my-custom-alert',
        buttons: [
          {
            text: okText ? okText : this.translate.instant('confirm'),
            handler: () => {
              console.log('ionicAlert_delTx Ok clicked');
              resolve();
            }
          }
        ]
      }).then(alert => alert.present());
    });
  };

  public ionicAlert_PublishedTx_fail(title: string, subTitle?: string, hash?: string, fail_detail?: string, okText?: string): Promise<any> {
    const sub = this.translate.instant(subTitle);
    const reason = this.translate.instant('reasons-failure');

    return new Promise((resolve, reject) => {
      const alert = this.alertCtrl.create({
        header : this.translate.instant(title),
        subHeader : reason + ':' + sub,
        backdropDismiss: false,
        cssClass: 'my-custom-alert',
        buttons: [
          {
            text: okText ? okText : this.translate.instant('confirm'),
            handler: () => {
              console.log('ionicAlert_PublishedTx_fail Ok clicked');
              resolve();
            }
          }
        ]
      }).then(alert => alert.present());
    });
  };

  public ionicAlert_PublishedTx_sucess(title: string, subTitle?: string,hash?:any,okText?: string): Promise<any> {
    let sub= this.translate.instant(subTitle);
    return new Promise((resolve, reject) => {
      this.alertCtrl.create({
        header : this.translate.instant(title),
        subHeader :sub+"<br/>"+"("+"txHash:"+hash+")",
        backdropDismiss: false,
        cssClass: 'my-custom-alert',
        buttons: [
          {
            text: okText ? okText : this.translate.instant('confirm'),
            handler: () => {
              console.log('ionicAlert_PublishedTx_sucess Ok clicked');
              resolve();
            }
          }
        ]
      }).then(alert => alert.present());
    });
  };

  // TODO: don't use a promise, use 2 callbacks here, "confirmed" and "cancelled"
  public ionicConfirm(
    title: string,
    message: string,
    okText?: string,
    cancelText?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.alertCtrl.create({
        header: this.translate.instant(title),
        message  : this.translate.instant(message),
        cssClass: 'alert',
        buttons: [
          {
            text: cancelText ? cancelText : this.translate.instant('cancel'),
            handler: () => {
              console.log('ionicConfirm Disagree clicked');
              resolve(false);
            }
          },
          {
            text: okText ? okText : this.translate.instant('confirm'),
            handler: () => {
              console.log('Agree clicked');
              resolve(true);
            }
          }
        ]
      }).then(confirm => confirm.present());
    });
  }

  // TODO: don't use a promise, use 2 callbacks here, "confirmed" and "cancelled"
  public ionicConfirmWithSubTitle(title: string, subTitle: string, message: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.alertCtrl.create({
        header: this.translate.instant(title),
        subHeader : subTitle,
        message  : this.translate.instant(message),
        cssClass: 'my-custom-alert',
        buttons: [
          {
            text: this.translate.instant('cancel'),
            handler: () => {
              console.log('ionicConfirm Disagree clicked');
              resolve(false);
            }
          },
          {
            text: this.translate.instant('confirm'),
            handler: () => {
              console.log('Agree clicked');
              resolve(true);
            }
          }
        ]
      }).then(confirm => confirm.present());
    });
  };

  // TODO: don't use a promise, use 2 callbacks here, "confirmed" and "cancelled"
  public ionicPrompt(title: string, message: string, opts?: any, okText?: string, cancelText?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let defaultText = opts && opts.defaultText ? opts.defaultText : null;
      let placeholder = opts && opts.placeholder ? opts.placeholder : null;
      let inputType = opts && opts.type ? opts.type : 'text';
      let cssClass = opts.useDanger ? "alertDanger" : null;
      let backdropDismiss = !!opts.backdropDismiss;

      this.alertCtrl.create({
        header:title,
        message,
        cssClass,
        backdropDismiss,
        inputs: [
          {
            value: defaultText,
            placeholder,
            type: inputType
          },
        ],
        buttons: [
          {
            text: cancelText ? cancelText : this.translate.instant('Cancel'),
            handler: data => {
              console.log('Cancel clicked');
              resolve(null);
            }
          },
          {
            text: okText ? okText : this.translate.instant('Ok'),
            handler: data => {
              console.log('Saved clicked');
              resolve(data[0]);
            }
          }
        ]
      }).then(prompt => prompt.present());
    });
  }
}