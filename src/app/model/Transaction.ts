export enum TransactionStatus {
    CONFIRMED = 'Confirmed',
    PENDING = 'Pending',
    UNCONFIRMED = 'Unconfirmed'
}

export enum TransactionDirection {
    RECEIVED = "Received",
    SENT = "Sent",
    MOVED = "Moved",
    DEPOSIT = "Deposit"
}

export enum TransactionType {
    RECEIVED = 1,
    SENT = 2,
    TRANSFER = 3
}

export type TransactionInfo = {
    amount: string,
    confirmStatus: number,
    datetime: any,
    direction: TransactionDirection,
    fee: number,
    memo: string;
    name: string,
    payStatusIcon: string,
    status: string,
    symbol: string,
    timestamp: number,
    txId: string,
    type: TransactionType,
};

export type Transaction = {
    Amount: string;
    Fee: number;
    ConfirmStatus: number;
    Direction: TransactionDirection;
    Height: number;
    Status: TransactionStatus;
    Timestamp: number;
    TopUpSidechain: string;
    TxHash: string;
    Type: number;
    OutputPayload: string;
    Inputs: any; // TODO: type
    Outputs: any; // TODO: type
    Memo: string;

    // ETHSC
    BlockNumber: number;
    Confirmations: number;
    ErrorDesc: string;
    GasLimit: number;
    GasPrice: string;
    GasUsed: number;
    Hash: string;
    ID: string;
    IsConfirmed: boolean;
    IsErrored: boolean;
    IsSubmitted: boolean;
    OriginTxHash: string;
    SourceAddress: string;
    TargetAddress: string;
};

export type AllTransactions = {
    MaxCount: number,
    Transactions: Transaction[]
};
