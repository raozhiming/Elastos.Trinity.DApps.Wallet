export enum WalletAccountType {
    STANDARD = "Standard",
    MULTI_SIGN = "Multi-Sign"
}

export class WalletAccount {
    singleAddress: boolean;
    Type: WalletAccountType;
}
