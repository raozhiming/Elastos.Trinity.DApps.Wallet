import { Component, OnInit } from '@angular/core';
import { Native } from '../../services/Native';
import { Config } from '../../services/Config';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-walletmode',
    templateUrl: './walletmode.page.html',
    styleUrls: ['./walletmode.page.scss'],
})
export class WalletmodePage implements OnInit {
    public multiObj: any;
    constructor(public route: ActivatedRoute,
        public native: Native) {
        this.route.queryParams.subscribe((data) => {
            console.log(data);
            // this.multiObj = data;
        });
    }

    ngOnInit() {
    }

    onClick(route) {
        this.native.Go(route, Config.multiObj);
    }
}
