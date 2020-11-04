import { Component, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Native } from 'src/app/services/native.service';
import { Util } from "../../../model/Util";
import { TranslateService } from '@ngx-translate/core';
import { WalletManager } from 'src/app/services/wallet.service';
import { WalletCreationService } from 'src/app/services/walletcreation.service';

@Component({
  selector: 'app-wallet-advanced-import',
  templateUrl: './wallet-advanced-import.page.html',
  styleUrls: ['./wallet-advanced-import.page.scss'],
})
export class WalletAdvancedImportPage implements OnInit {

  private masterWalletId = '1';
  public mnemonicSentence = '';
  public mnemonicWords = new Array<any>();

  constructor(
    private walletManager: WalletManager,
    private walletCreateService: WalletCreationService,
    private authService: AuthService,
    private native: Native,
    public translate: TranslateService,
    public events: Events,
  ) {
    this.masterWalletId = Util.uuid(6, 16);
  }

  ngOnInit() {
  }

  onMnemonicSentenceChanged() {
    this.mnemonicWords = this.mnemonicSentence.trim().split(" ");
    this.mnemonicWords = this.mnemonicWords.filter(item => item !== '');
  }

  inputMnemonicCompleted() {
    return this.mnemonicWords.length === 12;
  }

  async onImport() {
    // console.log('MNEMONIC SENTENCE', this.mnemonicSentence);
    // console.log('MNEMONIC WORDS ARRAY', this.mnemonicWords);

    if (this.inputMnemonicCompleted()) {
        console.log('Input string is valid');

        const payPassword = await this.authService.createAndSaveWalletPassword(this.masterWalletId);
        if (payPassword) {
            await this.native.showLoading();
            await this.importWalletWithMnemonic(payPassword);
        }
    } else {
        this.native.toast(this.translate.instant("mnemonic-import-missing-words"));
    }
  }

  async importWalletWithMnemonic(payPassword: string) {
    const mnemonicStr = this.mnemonicWords.join(' ');
    // console.log('MNEMONIC IMPORT', mnemonicStr);

    await this.walletManager.importMasterWalletWithMnemonic(
        this.masterWalletId,
        this.walletCreateService.name,
        mnemonicStr,
        this.walletCreateService.mnemonicPassword,
        payPassword,
        this.walletCreateService.singleAddress
    );

    this.events.publish("masterwalletcount:changed", {
        action: 'add',
    });

    this.native.toast_trans('import-text-word-sucess');
  }

}
