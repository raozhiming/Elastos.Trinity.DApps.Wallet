import { Component, OnInit } from '@angular/core';
import { ThemeService } from 'src/app/services/theme.service';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-tx-success',
  templateUrl: './tx-success.component.html',
  styleUrls: ['./tx-success.component.scss'],
})
export class TxSuccessComponent implements OnInit {

  constructor(
    public theme: ThemeService,
    public popover: PopoverController
  ) { }

  ngOnInit() {}

  continue() {
    this.popover.dismiss();
  }
}
