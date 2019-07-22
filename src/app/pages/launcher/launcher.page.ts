import { Component, OnInit } from '@angular/core';
import { Config } from '../../services/Config';

@Component({
    selector: 'app-launcher',
    templateUrl: './launcher.page.html',
    styleUrls: ['./launcher.page.scss'],
})
export class LauncherPage implements OnInit {

    constructor() {
        Config.multiObj = {};
    }

    ngOnInit() {

    }
}
