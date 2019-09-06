import { Component, OnInit } from '@angular/core';
import { WalletManager } from '../../services/WalletManager';
import { Native } from '../../services/Native';

@Component({
    selector: 'app-about',
    templateUrl: './about.page.html',
    styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {
    public version = "1.0.0";
    public spvVersion = "0";
    public commitVersion = "v0.12";
    constructor(public walletManager: WalletManager,
        public native: Native) {
        this.init();
    }

    ngOnInit() {
        console.log('ngOnInit AboutPage');
    }

    init() {
        this.walletManager.getVersion((data) => {
            this.spvVersion = data;
        });
    }

    goWebsite() {
        this.native.openUrl("http://www.elastos.org");
    }

}
