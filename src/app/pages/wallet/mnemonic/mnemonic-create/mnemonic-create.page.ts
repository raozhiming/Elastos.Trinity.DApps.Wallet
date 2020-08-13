import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { NavParams, Events, IonSlides } from '@ionic/angular';
import { Native } from '../../../../services/native.service';
import { WalletManager } from '../../../../services/wallet.service';
import { Config } from '../../../../config/Config';
import { Util } from '../../../../model/Util';
import { LocalStorage } from '../../../../services/storage.service';
import { ActivatedRoute } from '@angular/router';
import { WalletCreationService, SelectableMnemonic } from 'src/app/services/walletcreation.service';
import { AppService } from 'src/app/services/app.service';
import { TranslateService } from '@ngx-translate/core';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
    selector: 'app-mnemonic-create',
    templateUrl: './mnemonic-create.page.html',
    styleUrls: ['./mnemonic-create.page.scss'],
})
export class MnemonicCreatePage implements OnInit {

    @ViewChild('slider', {static: false}) slider: IonSlides;

    slideOpts = {
        initialSlide: 0,
        speed: 400,
        centeredSlides: true,
        slidesPerView: 1
    };

    masterWalletId: string = "1";
    mnemonicList: SelectableMnemonic[] = [];
    mnemonicStr: string;

    constructor(
        public route: ActivatedRoute,
        public walletManager: WalletManager,
        public native: Native,
        public localStorage: LocalStorage,
        public events: Events,
        public zone: NgZone,
        private walletCreationService: WalletCreationService,
        private appService: AppService,
        private translate: TranslateService
    ) {
        native.showLoading().then(() => {
            this.init();
        });
    }

    ngOnInit() {
    }

    ionViewWillEnter() {
        this.appService.setBackKeyVisibility(true);
        titleBarManager.setBackgroundColor('#6B26C6');
        titleBarManager.setForegroundMode(TitleBarPlugin.TitleBarForegroundMode.LIGHT);
        titleBarManager.setTitle(this.translate.instant('mnemonic'));
    }

    async init() {
        this.masterWalletId = Util.uuid(6, 16);
        this.mnemonicStr = await this.walletManager.spvBridge.generateMnemonic(this.native.getMnemonicLang());
        this.native.hideLoading();
        let mnemonicArr = this.mnemonicStr.split(/[\u3000\s]+/);
        this.zone.run(()=>{
            for (var i = 0; i < mnemonicArr.length; i++) {
                this.mnemonicList.push({ text: mnemonicArr[i], selected: false });
            }
        });
    }

    goToMnemonicWrite() {
        this.walletCreationService.masterId = this.masterWalletId;
        this.walletCreationService.mnemonicStr = this.mnemonicStr;
        this.walletCreationService.mnemonicList = this.mnemonicList;

        // this.walletCreationService.mnemonicPassword = this.mnemonicPassword;

        this.native.go("/mnemonic-write");
    }

    nextSlide(slide) {
        slide.slideNext();
    }
}

