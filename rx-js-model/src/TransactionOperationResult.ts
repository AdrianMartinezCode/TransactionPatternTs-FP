

export enum TransactionOperationState {
    SUCCESS, ERROR
}

export interface TransactionOperationResult {
    state : TransactionOperationState;
    error: Error | null;
    antErr?: TransactionOperationResult
}