import { SubWallet } from './SubWallet';
import { WalletAccount, WalletAccountType } from './WalletAccount';

export class MasterWallet {
    public name: string = "";
    public subWallets: {
        [k: string]: SubWallet
    };
    public chainList: any[] = []; // TODO
    public account: WalletAccount = {
        Type: WalletAccountType.STANDARD 
    };
    public totalBalance: number = 0;

    constructor(name?: string) {
        this.name = name || "";
        this.subWallets = {
            ELA: new SubWallet()
        }
    }
}