import { Component, OnInit, Input } from '@angular/core';
import { AppService } from '../../services/app.service';

@Component({
    selector: 'header-bar',
    templateUrl: './header-bar.component.html',
    styleUrls: ['./header-bar.component.scss'],
})
export class HeaderBarComponent implements OnInit {
    public back_touched = false;
    public _title: string = '';
    @Input('showBack') showBack: boolean = true;
    @Input('showMinimize') showMinimize: boolean = true;
    @Input('showClose') showClose: boolean = true;

    @Input()
    set title(title: string) {
        this._title = title;
    }

    constructor(public appService: AppService) { }

    ngOnInit() { }

    close() {
        this.appService.close();
    }
}
