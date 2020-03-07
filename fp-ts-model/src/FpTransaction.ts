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

interface CommitOp {
    commit: Task<Either<VError, {}>>;
}
interface SaveOp {
    saveData: Task<Either<VError, {}>>;
}
interface RollbackOp {
    rollback: Task<Either<SemiGroupVError, {}>>
}


export type FpOperation = CommitOp & SaveOp & RollbackOp & {
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

// TODO
const appendRollBackFromRollback = (rl: RollbackOp) => pipe(
    rl.rollback,
    T.chainFirst(e => T.of(pipe(sequenceT(applicativeValidation)(e))))
);

// TODO
export const appendFpOperation = (o: FpOperation) : FpOperation => <FpOperation>{

}