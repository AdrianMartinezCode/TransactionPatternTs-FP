import {TransactionOperationResult, TransactionOperationState} from "./TransactionOperationResult";
import {Observable} from "rxjs";
import {StandardOperation} from "./StandardOperation";


export function generateStandardOperation(operationObs : Observable<void>, operationCommit : Observable<void>) {
    return new StandardOperation(
        notificator => operationObs.subscribe(
            () => {},
            error => notificator({
                state: TransactionOperationState.ERROR,
                error: error
            } as TransactionOperationResult),
            () => notificator({
                state: TransactionOperationState.SUCCESS
            } as TransactionOperationResult)
        ),
        notificator => operationCommit.subscribe(
            () => {},
            error => notificator({
                state: TransactionOperationState.ERROR,
                error: error
            } as TransactionOperationResult),
            () => notificator({
                state: TransactionOperationState.SUCCESS
            } as TransactionOperationResult)
        )
    )
};
