import {TransactionOperationResult} from "./TransactionOperationResult";


export interface TransactionResult {
    transactionOperationResult : TransactionOperationResult;
    originalError?: Error;
    withRollback : boolean;
}