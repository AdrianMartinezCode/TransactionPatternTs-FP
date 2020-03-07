import {ITransactionOperation} from "./ITransactionOperation";
import {Observable, of} from "rxjs";
import {TransactionOperationResult, TransactionOperationState} from "./TransactionOperationResult";
import {flatMap, map} from "rxjs/operators";
import * as VError from "verror";
import {TransactionResult} from "./TransactionResult";

// import {VError} from "verror";

/**
 * Esta clase permite anidar transacciones, es una representación recursiva,
 * también es una operación asíncrona y atómica, se van acumulando operaciones
 * y una vez acabes de acumular utilizas el método "perform",
 * éste retorna un observable que una vez haya acabado toda la transacción
 * retornará un resultado, en este caso esta función también es asíncrona.
 *
 * La propia transacción también es tratada cómo una operación, entonces
 * yo puedo añadir una transacción a una transacción, de esta manera
 * puedo hacer un objeto que englobe muchas transacciones y tenga
 * un método único para hacer todas las operaciones.
 *
 */
export class Transaction implements ITransactionOperation {

    private operationList : ITransactionOperation[];
    private pointer : number;
    private started : boolean;
    private firstError : Error | null;

    constructor() {
        this.operationList = [];
        this.pointer = 0;
        this.started = false;
        this.firstError = null;
    }


    addOperation(operation: ITransactionOperation) : this {
        if (this.started) throw new Error("The transaction has been started, you can't add new operation.");
        this.operationList.push(operation);
        return this;
    }

    addOperations(operations: ITransactionOperation[]) : this {
        if (this.started) throw new Error("The Transaction has been started, you can't add new operation.");
        for (let i = 0; i < operations.length; i++)
            this.addOperation(operations[i]);
        return this;
    }

    perform() : Observable<TransactionResult> {
        return this.doOperation().pipe(
            flatMap(result => {
                if (result.state === TransactionOperationState.ERROR) {
                    // console.log(result);
                    return this.rollback().pipe(
                        map(result => <TransactionResult>{
                            transactionOperationResult: result,
                            originalError: this.firstError,
                            withRollback : true
                        })
                    );
                } else {
                    return of(<TransactionResult>{
                        transactionOperationResult: <TransactionOperationResult>{
                            state: TransactionOperationState.SUCCESS,
                        },
                        withRollback:false
                    });
                }
            })
        )
    }

    doOperation(): Observable<TransactionOperationResult> {
        this.started = true;
        if (this.pointer < this.operationList.length) {
            return this.operationList[this.pointer++].doOperation().pipe(
                flatMap(result => {
                    if (result.state === TransactionOperationState.ERROR) {
                        this.firstError = result.error;
                        return of(result);
                    } else {
                        return this.doOperation();
                    }
                })
            );
        } else {
            return of(<TransactionOperationResult>{
                state : TransactionOperationState.SUCCESS,
                error: null
            });
        }
    }

    rollback(): Observable<TransactionOperationResult> {
        if (!this.started) throw new Error("Called rollback of transaction when the transaction not started.");
        if (this.pointer > 0) {
            return this.operationList[--this.pointer].rollback().pipe(
                flatMap(result => {
                    if (result.state === TransactionOperationState.ERROR) {
                        console.log({text: "on rollback", result: JSON.stringify(result)});
                        return this.rollback().pipe(
                            map(r => <TransactionOperationResult>{
                                state: TransactionOperationState.ERROR,
                                error: new VError(result.error, "Rollback error."),
                                antErr: r
                            })
                        );
                    } else {
                        return this.rollback();
                    }
                })
            );
        } else {
            return of(<TransactionOperationResult>{
                state: TransactionOperationState.SUCCESS,
                error: this.firstError
            });
        }
    }

}
