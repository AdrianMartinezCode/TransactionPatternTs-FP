import {Observable} from "rxjs";
import {TransactionOperationResult} from "./TransactionOperationResult";


export interface ITransactionOperation  {


    doOperation() : Observable<TransactionOperationResult>;

    rollback() : Observable<TransactionOperationResult>;

}