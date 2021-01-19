import { Component, OnInit } from '@angular/core';
import { Util } from '../../../model/Util';
import { Native } from '../../../services/native.service';
import { LocalStorage } from '../../../services/storage.service';
import { ActivatedRoute } from '@angular/router';
import { WalletManager } from 'src/app/services/wallet.service';
import { WalletEditionService } from 'src/app/services/walletedition.service';
import { MasterWallet } from 'src/app/model/wallets/MasterWallet';
import { ThemeService } from 'src/app/services/theme.service';
import { AppService } from 'src/app/services/app.service';
import { TranslateService } from '@ngx-translate/core';
import { Events } from 'src/app/services/events.service';

@Component({
    selector: 'app-wallet-edit-name',
    templateUrl: './wallet-edit-name.page.html',
    styleUrls: ['./wallet-edit-name.page.scss'],
})
export class WalletEditNamePage implements OnInit {

    public walletname: string = "";
    public masterWallet: MasterWallet = null;

    constructor(
        public route: ActivatedRoute,
        public native: Native,
        public localStorage: LocalStorage,
        public events: Events,
        private walletManager: WalletManager,
        private walletEditionService: WalletEditionService,
        private appService: AppService,
        private translate: TranslateService,
        public theme: ThemeService
    ) {
        this.masterWallet = this.walletManager.getMasterWallet(this.walletEditionService.modifiedMasterWalletId);
        this.walletname = this.walletManager.masterWallets[this.masterWallet.id].name;
    }

    ngOnInit() {
        console.log('ngOnInit ModifywalletnamePage');
    }

    ionViewWillEnter() {
        this.appService.setTitleBarTitle(this.translate.instant("wallet-edit-name-title"));
    }

    modify() {
        if (Util.isNull(this.walletname)) {
            this.native.toast_trans("text-wallet-name-validator-enter-name");
            return;
        }

        if (Util.isWalletName(this.walletname)) {
            this.native.toast_trans("text-wallet-name-validator-not-valid-name");
            return;
        }

        if (this.walletManager.walletNameExists(this.walletname)) {
            this.native.toast_trans("text-wallet-name-validator-already-exists");
            return;
        }

        this.modifyName();
    }

    async modifyName() {
        this.walletManager.masterWallets[this.masterWallet.id].name = this.walletname;
        await this.walletManager.saveMasterWallet(this.masterWallet);
        this.native.pop();
    }
}
