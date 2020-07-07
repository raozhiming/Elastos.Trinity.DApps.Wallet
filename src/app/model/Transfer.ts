import { CoinName } from './MasterWallet';

// TODO: Split this bloody mess into appropriate classes dedicated to each feature.
export class Transfer {
    action: string = null;
    intentId: Number = null;
    memo: string = null;
    did: string = null;
    nickname: string = null;
    url: string = null;
    crPublicKey: string = null;
    account: string = null;
    rawTransaction: string = null;
    payPassword: string = null;
    location: number = null;
    crDID: string = null;
    from: string = null;
    fee: number = 0;
    chainId: CoinName = null;
    votes: any; // TODO
    invalidCandidates: any; // TODO
    amount: number = 0;
    publickey: string;
    toAddress: string = 'default';
    publicKeys: any;
    didrequest: string;
    type: string = 'payment-confirm';
    sideChainId: string;
}