import { Component, OnInit } from '@angular/core';
import { Native } from '../../services/Native';
import { Config } from '../../services/Config';

@Component({
    selector: 'app-createmultiwallet',
    templateUrl: './createmultiwallet.page.html',
    styleUrls: ['./createmultiwallet.page.scss'],
})
export class CreatemultiwalletPage implements OnInit {
    public copayers: number[] = [1, 2, 3, 4, 5, 6];
    public signatures: number[] = [1, 2, 3, 4, 5, 6];
    public totalCopayers: number = 2;
    public requiredCopayers: number = 2;

    constructor(public native: Native) { }

    ngOnInit() {
    }

    public setTotalCopayers(): void {

    }

    onNext() {
        if (this.totalCopayers < this.requiredCopayers) {
            this.native.toast_trans("text-multi-error");
            return;
        }
        Config.walletObj.totalCopayers = this.totalCopayers
        Config.walletObj.requiredCopayers = this.requiredCopayers;
        this.native.go("/walletmode");
    }

}

