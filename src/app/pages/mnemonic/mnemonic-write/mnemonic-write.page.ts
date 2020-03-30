import { Component, OnInit, NgZone } from '@angular/core';
import { Native } from '../../../services/Native';
import { Util } from "../../../services/Util";
import { Config } from '../../../services/Config';
import { ActivatedRoute } from '@angular/router';
import { Events } from '@ionic/angular';
import { WalletManager } from '../../../services/WalletManager';

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
    walletObj = {};
    constructor(public route: ActivatedRoute,
        public native: Native,
        public events: Events,
        public walletManager: WalletManager,
        public zone: NgZone) {

        this.mnemonicStr = this.native.clone(Config.walletObj.mnemonicStr);
        this.mnemonicList = this.native.clone(Config.walletObj.mnemonicList);
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
                this.native.go("/mpublickey", this.exatParm);
            }
            else {
                this.native.toast_trans('text-mnemonic-ok');
                this.native.showLoading().then(() => {
                    this.walletManager.createMasterWallet(Config.walletObj.masterId, this.mnemonicStr,
                        Config.walletObj.mnemonicPassword, Config.walletObj.payPassword,
                        Config.walletObj.singleAddress, () => {
                        this.createSubWallet();
                    });
                });
            }

        } else {
            this.native.toast_trans('text-mnemonic-prompt3');
        }
    }

    async createSubWallet() {
        this.walletManager.createSubWallet(Config.walletObj.masterId, "ELA", () => {
            let account = { "singleAddress": Config.walletObj.singleAddress, "Type": "Standard" };
            Config.masterManager.addMasterWallet(Config.walletObj.masterId, Config.walletObj.name, account);
            // open IDChain for did
            this.walletManager.createSubWallet(Config.walletObj.masterId, "IDChain", () => {});
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
    }
}

