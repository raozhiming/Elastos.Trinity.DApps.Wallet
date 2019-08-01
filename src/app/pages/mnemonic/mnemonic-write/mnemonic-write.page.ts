import { Component, OnInit, NgZone } from '@angular/core';
import { Native } from '../../../services/Native';
import { Util } from "../../../services/Util";
import { Config } from '../../../services/Config';
import { ActivatedRoute } from '@angular/router';
import { Events } from '@ionic/angular';

@Component({
    selector: 'app-mnemonic-write',
    templateUrl: './mnemonic-write.page.html',
    styleUrls: ['./mnemonic-write.page.scss'],
})
export class MnemonicWritePage implements OnInit {
    mnemonicList: Array<any> = []
    selectList: Array<any> = [];
    mnemonicStr: string;
    selectComplete = false;
    multType: any = {};
    exatParm: any;
    constructor(public route: ActivatedRoute,
        public native: Native,
        public events: Events,
        public zone: NgZone) {
        // this.route.queryParams.subscribe((data) => {
        //     if (typeof(data["mult"]) == "string") {
        //         this.multType = JSON.parse(data["mult"]);
        //         console.log(this.multType);
        //     }
        //     console.log(data);
        //     this.exatParm = this.native.clone(data);
        //     this.mnemonicStr = this.native.clone(data["mnemonicStr"]);
        //     this.mnemonicList = JSON.parse(data["mnemonicList"]);

        //     // this.mnemonicList = this.mnemonicList.sort(function(){ return 0.5 - Math.random() });
        // });
        this.mnemonicStr = Config.walletObj.mnemonicStr;
        this.mnemonicList = Config.walletObj.mnemonicList;
        this.mnemonicList = this.mnemonicList.sort(function(){ return 0.5 - Math.random() });
    }

    ngOnInit() {
    }

    onNext() {
        let mn = "";
        for (let i = 0; i < this.selectList.length; i++) {
            mn += this.selectList[i].text;
        }

        if (!Util.isNull(mn) && mn == this.mnemonicStr.replace(/\s+/g, "")) {
            if (Config.walletObj.isMulti) {
                this.native.Go("/mpublickey", this.exatParm);
            } else {
                this.native.toast_trans('text-mnemonic-ok');
                this.native.setRootRouter("/tabs");
                this.events.publish("wallet:update", Config.getCurMasterWalletId());
            }

        } else {
            this.native.toast_trans('text-mnemonic-prompt3');
        }
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
    }
}

