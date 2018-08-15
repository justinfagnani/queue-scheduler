import { Deferred } from './deferred.js';
const notStarted = 0;
const started = 1;
const complete = 2;
const canceled = 3;
export class TaskContext {
    constructor(task) {
        this._state = notStarted;
        /**
         * Controls the Promise returned by completed. Resolves when the task returns.
         */
        this._completedDeferred = new Deferred();
        this._yieldDeferred = new Deferred();
        this._task = task;
    }
    get completed() { return this._completedDeferred.promise; }
    /**
     * Yields control back to the scheduler. Returns a Promise that resolves when
     * the scheduler continues the task, or rejects if the scheduler cancels the
     * task.
     */
    yield() {
        console.assert(this._continueDeferred === undefined);
        const _yield = this._yieldDeferred.resolve;
        this._yieldDeferred = new Deferred();
        _yield(false);
        this._continueDeferred = new Deferred();
        return this._continueDeferred.promise;
    }
    /**
     * Continues or starts this task.
     *
     * _continue() starts a task function by invoking it, and continues a task by
     * resolving the Promise returned from the last TaskContext.yield() call.
     *
     * Returns a Promise that resolves when the task yields.
     */
    async continue() {
        if (this._state === notStarted) {
            this._state = started;
            // We haven't started the task, so invoke the task function.
            (async () => {
                try {
                    // force task start to wait so we can await it yielding first
                    await 0;
                    const result = await this._task.call(null, this);
                    this._completedDeferred.resolve(result);
                }
                catch (e) {
                    this._completedDeferred.reject(e);
                }
                finally {
                    // continue() is waiting on _context.yielded, so resolve it to keep
                    // going
                    this._yieldDeferred.resolve(true);
                }
            })();
        }
        else if (this._state === started) {
            // The task is started and has called TaskContext.yield()
            // const context = this._context;
            console.assert(this._continueDeferred !== undefined);
            const _continue = this._continueDeferred.resolve;
            this._continueDeferred = undefined;
            _continue();
        }
        else {
            throw new Error('continue() called on non-running task');
        }
        // Wait till the task yields
        return this._yieldDeferred.promise;
    }
    /**
     * Cancels a running task by rejecting the Promise returned from yield().
     */
    cancel() {
        console.assert(this._state !== canceled);
        if (this._state === notStarted) {
            // Nothing to cleanup, just change the state
            this._state = canceled;
        }
        else if (this._state === started) {
            // The task is started and has called TaskContext.yield()
            console.assert(this._continueDeferred !== undefined);
            const _cancel = this._continueDeferred.reject;
            this._continueDeferred = undefined;
            // Rejects the Promise returned from the last TaskContext.yield() call
            // This should in turn reject or resolve the Promise returned by the task
            // function. If not it means the task caught the CancelError and ignored
            // it. If we can detect that case we should reject the _completed Promise
            // via _rejectCompleted().
            _cancel(new Error('Task canceled'));
        }
    }
}
//# sourceMappingURL=task-context.js.map