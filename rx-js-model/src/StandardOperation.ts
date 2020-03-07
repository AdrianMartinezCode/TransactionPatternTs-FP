import {ITransactionOperation} from "./ITransactionOperation";
import {TransactionOperationResult} from "./TransactionOperationResult";
import {Observable} from "rxjs";


export class StandardOperation implements ITransactionOperation {

    private readonly methodDoOp : (callback : (v: TransactionOperationResult) => void) => void;
    private readonly methodRollback : (callback : (v: TransactionOperationResult) => void) => void;

    constructor(
        methodDoOp : (callback : (v: TransactionOperationResult) => void) => void,
        methodRollback : (callback : (v: TransactionOperationResult) => void) => void
    ) {
        this.methodDoOp = methodDoOp;
        this.methodRollback  = methodRollback;
    }

    doOperation(): Observable<TransactionOperationResult> {
        return new Observable<TransactionOperationResult>(subscriber => {
            this.methodDoOp(result => {
                subscriber.next(result);
                subscriber.complete();
            });
        });
    }

    rollback(): Observable<TransactionOperationResult> {
        return new Observable<TransactionOperationResult>(subscriber => {
            this.methodRollback(result => {
                subscriber.next(result);
                subscriber.complete();
            });
        });
    }

}