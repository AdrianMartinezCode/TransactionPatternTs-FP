import {Semigroup} from "fp-ts/lib/Semigroup";
import * as VError from "verror";
import {getValidation} from "fp-ts/es6/Either";
import {Either} from "fp-ts/lib/Either";
import {Task} from "fp-ts/lib/Task";
import {pipe} from "fp-ts/lib/pipeable";
import * as T from "fp-ts/lib/Task";
import * as E from "fp-ts/lib/Either";
import {sequenceT} from "fp-ts/lib/Apply";


type SemiGroupVError = Semigroup<VError>;

const SemiGroupVErrorImpl = <SemiGroupVError> {
    concat: (e1, e2) => new VError.MultiError([e1, e2])
};

// The function to do the commit.
interface CommitOp {
    commit: Task<Either<VError, {}>>;
}
// The rollback operation requires the initial state to restore.
interface SaveOp<A> {
    saveData: Task<Either<VError, A>>;
}
//
interface RollbackOp<A> {
    rollback(ta: Task<A>): Task<Either<VError, {}>>
}


export type FpOperation<A> = CommitOp & SaveOp<A> & RollbackOp<A> & {
    operationId: string
};



// Eithers for CommitOperations
const appendCommitFromCommit = (op: CommitOp) => pipe(
    op.commit,
    T.chain(e => T.of(pipe(
        e,
        E.chain(_ => E.right({}))
    )))
);


// Validations for RollbackOperations
const applicativeValidation = getValidation(SemiGroupVErrorImpl);

// We need a asynchronous computation for the retrieve the value, the appendRollBack operation
//  must not require the value, we need to build the lazy execution.
const appendRollBackFromRollback = <A>(rl: RollbackOp<A>, a: Task<A>) => pipe(
    rl.rollback(a),
    T.chainFirst(e => T.of(sequenceT(applicativeValidation)(e)))
);

// TODO
export const appendFpOperation = <A>(o: FpOperation<A>) : FpOperation<A> => <FpOperation<A>>{

}