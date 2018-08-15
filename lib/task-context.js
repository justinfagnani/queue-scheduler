export class TaskContext {
    constructor() {
        this._continue = undefined;
        this._cancel = undefined;
        this._yielded = new Promise((resolve, reject) => {
            this._yield = resolve;
            this._error = reject;
        });
    }
    /**
     * Yields control back to the scheduler. Returns a Promise that resolves when
     * the scheduler continues the task, or rejects if the scheduler cancels the
     * task.
     */
    nextTick() {
        console.assert(this._continue === undefined);
        console.assert(this._cancel === undefined);
        const _yield = this._yield;
        this._yielded = new Promise((resolve, reject) => {
            this._yield = resolve;
            this._error = reject;
        });
        _yield(false);
        return new Promise((resolve, reject) => {
            this._continue = resolve;
            this._cancel = reject;
        });
    }
}
//# sourceMappingURL=task-context.js.map