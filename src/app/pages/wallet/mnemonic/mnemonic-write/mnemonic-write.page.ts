import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { Native } from '../../../../services/native.service';
import { Util } from "../../../../model/Util";
import { ActivatedRoute } from '@angular/router';
import { Events, IonSlides } from '@ionic/angular';
import { WalletManager } from '../../../../services/wallet.service';
import { WalletCreationService, SelectableMnemonic } from 'src/app/services/walletcreation.service';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
    selector: 'app-mnemonic-write',
    templateUrl: './mnemonic-write.page.html',
    styleUrls: ['./mnemonic-write.page.scss'],
})
export class MnemonicWritePage implements OnInit {

    @ViewChild('slider', {static: false}) slider: IonSlides;

    slideOpts = {
        initialSlide: 0,
        speed: 400,
        centeredSlides: true,
        slidesPerView: 1
    };

    // Currently not in use
    mnemonicList: SelectableMnemonic[] = [];
    selectList: Array<any> = [];
    selectComplete = false;

    public word1 = "";
    public word2 = "";
    public word3 = "";
    public word4 = "";
    public word5 = "";
    public word6 = "";
    public word7 = "";
    public word8 = "";
    public word9 = "";
    public word10 = "";
    public word11 = "";
    public word12 = "";

    private inputStr: string = "";
    private mnemonicStr: string;

    constructor(
        public route: ActivatedRoute,
        public native: Native,
        public events: Events,
        public walletManager: WalletManager,
        private walletCreationService: WalletCreationService,
        public zone: NgZone
    ) {
        this.mnemonicStr = this.native.clone(this.walletCreationService.mnemonicStr);
        this.mnemonicList = this.native.clone(this.walletCreationService.mnemonicList);
        this.mnemonicList = this.mnemonicList.sort(() => {
            return 0.5 - Math.random();
        });
    }

    ngOnInit() {

    }

    /*********************************************************************************
     * Failed method to loop through each string in an array of empty strings and
     * tie it to a certain input. A more expedient method is currently in use
    /*********************************************************************************
    ngOnInit() {
        for (let i = 0; i < 12; i ++) {
            this.selectList.push(i);
        }
        console.log(this.selectList, 'select list');
    }

    // For testing purposes
    inputChanged(event, index: number) {
        console.log('Input test', event);
        console.log(this.selectList);
    }

    isWord(word): boolean {
        if (isNaN(word)) {
          return true;
        } else {
          return false;
        }
    } */

    ionViewWillEnter() {
        titleBarManager.setBackgroundColor('#732cd0');
        titleBarManager.setForegroundMode(TitleBarPlugin.TitleBarForegroundMode.LIGHT);
        titleBarManager.setTitle('Mnemonic Verify');
    }

    // For testing purposes
    inputChanged(event) {
        console.log('Input test', event);
        console.log(this.selectList);
    }

    async onNext() {
        if (this.allInputsFilled()) {
            if (this.inputStr.replace(/\s+/g, "") === this.mnemonicStr.replace(/\s+/g, "")) {
                if (this.walletCreationService.isMulti) {
                    this.native.go("/mpublickey");
                } else {
                    this.native.toast_trans('text-mnemonic-ok');
                    await this.native.showLoading();
                    await this.walletManager.createNewMasterWallet(
                            this.walletCreationService.masterId,
                            this.walletCreationService.name,
                            this.mnemonicStr,
                            this.walletCreationService.mnemonicPassword,
                            this.walletCreationService.payPassword,
                            this.walletCreationService.singleAddress
                        );
                }

            } else {
                console.log('Inputstr - ', this.inputStr);
                console.log('Mnemonic str - ', this.mnemonicStr);
                this.inputStr = "";
                this.native.toast_trans('text-mnemonic-prompt3');
            }
        } else {
            console.log('Current progress for input string', this.inputStr);
            this.inputStr = "";
            this.native.toast('Please fill in all inputs before proceeding');
        }
    }

    allInputsFilled() {
        if (this.word1 === '') {
            return false;
        } else {
            this.inputStr += this.word1;
        }
        if (this.word2 === '') {
            return false;
        } else {
            this.inputStr += this.word2;
        }
        if (this.word3 === '') {
            return false;
        } else {
            this.inputStr += this.word3;
        }
        if (this.word4 === '') {
            return false;
        } else {
            this.inputStr += this.word4;
        }
        if (this.word5 === '') {
            return false;
        } else {
            this.inputStr += this.word5;
        }
        if (this.word6 === '') {
            return false;
        } else {
            this.inputStr += this.word6;
        }
        if (this.word7 === '') {
            return false;
        } else {
            this.inputStr += this.word7;
        }
        if (this.word8 === '') {
            return false;
        } else {
            this.inputStr += this.word8;
        }
        if (this.word9 === '') {
            return false;
        } else {
            this.inputStr += this.word9;
        }
        if (this.word10 === '') {
            return false;
        } else {
            this.inputStr += this.word10;
        }
        if (this.word11 === '') {
            return false;
        } else {
            this.inputStr += this.word11;
        }
        if (this.word12 === '') {
            return false;
        } else {
            this.inputStr += this.word12;
        }
        return true;
    }

    /******************************************************
     * OLD CODE, NO LONGER USED BUT KEPT FOR REFERENCE
    ******************************************************/
 /*    async onNext() {
        let mn = "";
        for (let i = 0; i < this.selectList.length; i++) {
            mn += this.selectList[i].text;
        }

        if (!Util.isNull(mn) && mn === this.mnemonicStr.replace(/\s+/g, "")) {
            if (this.walletCreationService.isMulti) {
                this.native.go("/mpublickey");
            } else {
                this.native.toast_trans('text-mnemonic-ok');
                await this.native.showLoading();

                await this.walletManager.createNewMasterWallet(
                    this.walletCreationService.masterId,
                    this.walletCreationService.name,
                    this.mnemonicStr,
                    this.walletCreationService.mnemonicPassword,
                    this.walletCreationService.payPassword,
                    this.walletCreationService.singleAddress
                );
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
    } */
}

