import {TransactionOperationResult} from "./TransactionOperationResult";


export interface TransactionResult {
    transactionOperationResult : TransactionOperationResult;
    originalError: Error | null;
    withRollback : boolean;
}