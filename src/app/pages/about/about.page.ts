import { Component, OnInit } from '@angular/core';
import { WalletManager } from '../../services/WalletManager';
import { AppService } from '../../services/AppService';
import { Native } from '../../services/Native';

@Component({
    selector: 'app-about',
    templateUrl: './about.page.html',
    styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {
    public version = "1.0.0";
    public spvVersion = "0";
    // public commitVersion = "v0.12";
    constructor(public walletManager: WalletManager,
                public appService: AppService,
                public native: Native) {
        this.init();
    }

    ngOnInit() {
    }

    async init() {
        this.version = await this.appService.getVersion();
        this.walletManager.getVersion((data: string) => {
            this.spvVersion = data;
        });
    }

    goWebsite() {
        this.native.openUrl("http://www.elastos.org");
    }

}
