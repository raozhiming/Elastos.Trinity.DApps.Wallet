export type CoinID = string; // ELA, IDChain, ERC1, ERC2...

export enum CoinType {
    STANDARD = "standard", // For ELA, IDChain, ETHChain
    ERC20 = "erc20" // For ERC20 tokens
}

export class Coin {
    constructor(private type: CoinType, private id: CoinID, private name: string, private description: string) {}

    public getType(): CoinType {
        return this.type;
    }

    public getID(): CoinID {
        return this.id;
    }

    public getName(): string {
        return this.name; 
    }
 
    public getDescription(): string {
        return "Elastos Ethereum sidechain"
    }

    public canBeRemoved() : boolean {
        return true; // TODO: except for ELA
    }
}