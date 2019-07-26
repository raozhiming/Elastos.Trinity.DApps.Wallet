import { Component, OnInit } from '@angular/core';
import { Config } from '../../services/Config';
import { Native } from '../../services/Native';

@Component({
    selector: 'app-launcher',
    templateUrl: './launcher.page.html',
    styleUrls: ['./launcher.page.scss'],
})
export class LauncherPage implements OnInit {

    constructor(public native: Native) {

    }

    ngOnInit() {

    }


    onNext(type) {
        Config.walletObj = {isMulti: false};
        switch (type) {
            case 1:
                this.native.Go("/wallet-create");
                break;
            case 2:
                this.native.Go("/wallet-import");
                break;
            case 3:
                Config.walletObj.isMulti = true;
                this.native.Go("/createmultiwallet");
                break;
        }
    }
}
