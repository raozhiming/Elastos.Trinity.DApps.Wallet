import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { ThemeService } from 'src/app/services/theme.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-tx-confirm',
  templateUrl: './tx-confirm.component.html',
  styleUrls: ['./tx-confirm.component.scss'],
})
export class TxConfirmComponent implements OnInit {

  public txInfo;

  public txHeader: string;
  public txIcon: string;

  constructor(
    private navParams: NavParams,
    public theme: ThemeService,
    private popoverCtrl: PopoverController
  ) { }

  ngOnInit() {
    this.txInfo = this.navParams.get('txInfo');
    console.log('Confirm tx', this.txInfo);

    if (this.txInfo.type === 'recharge') {
      this.txHeader = 'Transfer Transaction';
      this.txIcon = './assets/tx/transfer.svg';
    } else {
      this.txHeader = 'Send Transaction';
      this.txIcon = './assets/tx/send.svg';
    }
  }

  cancel() {
    this.popoverCtrl.dismiss();
  }

  confirm() {
    this.popoverCtrl.dismiss({
      confirm: true
    });
  }
}
