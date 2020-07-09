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

export type Transaction = {
    Amount: number;
    Fee: number;
    ConfirmStatus: string;
    Direction: TransactionDirection;
    Height: number;
    Status: TransactionStatus;
    Timestamp: number;
    TxHash: string;
    Type: number;
    OutputPayload: string;
    Inputs: any; // TODO: type
    Outputs: any; // TODO: type
    Memo: string;
};

export type AllTransactions = {
    MaxCount: number,
    Transactions: Transaction[]
}