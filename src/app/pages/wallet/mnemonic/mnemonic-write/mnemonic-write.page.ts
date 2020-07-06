import { Component, OnInit, NgZone } from '@angular/core';
import { Native } from '../../../../services/native.service';
import { Util } from "../../../../model/Util";
import { Config } from '../../../../config/Config';
import { ActivatedRoute } from '@angular/router';
import { Events } from '@ionic/angular';
import { WalletManager } from '../../../../services/wallet.service';

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

        this.mnemonicStr = this.native.clone(this.walletManager.walletObj.mnemonicStr);
        this.mnemonicList = this.native.clone(this.walletManager.walletObj.mnemonicList);
        this.mnemonicList = this.mnemonicList.sort(function(){ return 0.5 - Math.random() });
    }

    ngOnInit() {
    }

    async onNext() {
        let mn = "";
        for (let i = 0; i < this.selectList.length; i++) {
            mn += this.selectList[i].text;
        }

        if (!Util.isNull(mn) && mn == this.mnemonicStr.replace(/\s+/g, "")) {
            if (this.walletManager.walletObj.isMulti) {
                this.native.go("/mpublickey", this.exatParm);
            }
            else {
                this.native.toast_trans('text-mnemonic-ok');
                await this.native.showLoading();
                await this.walletManager.spvBridge.createMasterWallet(
                    this.walletManager.walletObj.masterId, 
                    this.mnemonicStr,
                    this.walletManager.walletObj.mnemonicPassword, 
                    this.walletManager.walletObj.payPassword,
                    this.walletManager.walletObj.singleAddress);
                await this.createSubWallet();
            }

        } else {
            this.native.toast_trans('text-mnemonic-prompt3');
        }
    }

    async createSubWallet() {
        await this.walletManager.spvBridge.createSubWallet(this.walletManager.walletObj.masterId, "ELA");
        
        let account = { "singleAddress": this.walletManager.walletObj.singleAddress, "Type": "Standard" };
        this.walletManager.addMasterWallet(this.walletManager.walletObj.masterId, this.walletManager.walletObj.name/*, account*/);
        
        // open IDChain for did
        await this.walletManager.spvBridge.createSubWallet(this.walletManager.walletObj.masterId, "IDChain");
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

