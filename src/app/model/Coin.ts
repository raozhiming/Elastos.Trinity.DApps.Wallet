export type CoinID = string; // ELA, IDChain, ERC1, ERC2...

export enum CoinType {
    STANDARD = "STANDARD", // For ELA, IDChain, ETHSC
    ERC20 = "ERC20" // For ERC20 tokens
}

export enum StandardCoinName {
    ELA = 'ELA',
    IDChain = 'IDChain',
    ETHSC = 'ETHSC'
}

export namespace StandardCoinName {
    export function fromCoinID(coinID: CoinID): StandardCoinName {
        console.log("debug fromCoinID ", coinID)
        return StandardCoinName[coinID];
    }
}

export class Coin {
    constructor(private type: CoinType, private id: CoinID, private name: string, private description: string, private removable: boolean) {}

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
        return this.removable;
    }
}

export class StandardCoin extends Coin {
    constructor(id: CoinID, name: string, description: string) {
        super(CoinType.STANDARD, id, name, description, false);
    }
}

export class ERC20Coin extends Coin {
    constructor(id: CoinID, name: string, description: string, private erc20ContractAddress: string) {
        super(CoinType.ERC20, id, name, description, true);
    }

    /**
     * Returns the Ethereum sidechain smart contract address for this coin.
     * Used to operate this coin (balance, transfer, etc).
     */
    getContractAddress(): string {
        return this.erc20ContractAddress;
    }
}