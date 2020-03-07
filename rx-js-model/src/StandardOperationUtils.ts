import {TransactionOperationResult, TransactionOperationState} from "./TransactionOperationResult";
import {Observable} from "rxjs";
import {StandardOperation} from "./StandardOperation";


export function generateStandardOperation(operationObs : Observable<void>, operationCommit : Observable<void>) {
    return new StandardOperation(
        notificator => operationObs.subscribe(
            () => {},
            error => notificator(<TransactionOperationResult>{
                state: TransactionOperationState.ERROR,
                error: error
            }),
            () => notificator(<TransactionOperationResult>{
                state: TransactionOperationState.SUCCESS
            })
        ),
        notificator => operationCommit.subscribe(
            () => {},
            error => notificator(<TransactionOperationResult>{
                state: TransactionOperationState.ERROR,
                error: error
            }),
            () => notificator(<TransactionOperationResult>{
                state: TransactionOperationState.SUCCESS
            })
        )
    )
};
