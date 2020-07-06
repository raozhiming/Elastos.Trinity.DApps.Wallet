import { Component, OnInit, NgZone } from '@angular/core';
import { Native } from '../../../../services/native.service';
import { Util } from '../../../../model/Util';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-mnemonic-check',
    templateUrl: './mnemonic-check.page.html',
    styleUrls: ['./mnemonic-check.page.scss'],
})
export class MnemonicCheckPage implements OnInit {
    mnemonicList: Array<any> = [];
    selectList: Array<any> = [];
    mnemonicStr: string;
    selectComplete = false;
    constructor(public route: ActivatedRoute, public native: Native, public zone: NgZone) {
        this.init();
    }

    ngOnInit() {
        console.log('ngOnInit CheckmnemonicPage');
    }

    init() {
        this.route.queryParams.subscribe((data) => {
            this.mnemonicStr = this.native.clone(data["mnemonicStr"]);
            this.mnemonicList = JSON.parse(data["mnemonicList"]);
            this.mnemonicList = this.mnemonicList.sort(function () { return 0.5 - Math.random() });
        });

    }

    public addButton(index: number, item: any): void {
        var newWord = {
            text: item.text,
            prevIndex: index
        };
        this.zone.run(() => {
            this.selectList.push(newWord);
            this.mnemonicList[index].selected = true;
            this.shouldContinue();
        });
    }



    public removeButton(index: number, item: any): void {
        this.zone.run(() => {
            this.selectList.splice(index, 1);
            this.mnemonicList[item.prevIndex].selected = false;
            this.shouldContinue();
        });
    }

    private shouldContinue(): void {
        this.selectComplete = this.selectList.length === this.mnemonicList.length ? true : false;
        if (this.selectComplete) {

            let mn = "";
            for (let i = 0; i < this.selectList.length; i++) {
                mn += this.selectList[i].text;
            }
            if (!Util.isNull(mn) && mn == this.mnemonicStr.replace(/\s+/g, "")) {
                this.native.toast_trans('text-export-menmonic-sucess');
                //TODO::
                // this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length()-3));
            } else {
                this.native.toast_trans('text-mnemonic-prompt3');
            }

        }

    }

}
