import { TaskContext } from './task-context.js';
export class Task {
    constructor(taskFn, queue) {
        this._context = undefined;
        this._isComplete = false;
        this._isCanceled = false;
        this._taskFn = taskFn;
        this._queue = queue;
        this._completed = new Promise((resolve, reject) => {
            this._resolveCompleted = resolve;
            this._rejectCompleted = reject;
        });
    }
    get completed() { return this._completed; }
    /**
     * Continues or starts this task.
     *
     * _continue() starts a task function by invoking it, and continues a task by
     * resolving the Promise returned from the last TaskContext.nextTick() call.
     *
     * Returns a Promise that resolves when the task yields.
     */
    async _continue() {
        if (this._context === undefined) {
            this._context = new TaskContext();
            // We haven't started the task, so invoke the task function.
            (async () => {
                try {
                    // force task start to wait so we can await it yielding first
                    await Promise.resolve();
                    const result = await this._taskFn.call(null, this._context);
                    this._resolveCompleted(result);
                }
                catch (e) {
                    this._rejectCompleted(e);
                }
                finally {
                    // Cleanup
                    // _continue() is waiting on _context.yielded, so resolve it to keep
                    // going
                    this._context._yield(true);
                }
            })();
        }
        else {
            // The task is started and has called TaskContext.nextTick()
            const context = this._context;
            console.assert(context._continue !== undefined);
            console.assert(context._cancel !== undefined);
            const _continue = context._continue;
            context._continue = undefined;
            context._cancel = undefined;
            _continue();
        }
        // Wait till the task yields
        return this._context._yielded;
    }
    cancel() {
        console.assert(this._isCanceled === false);
        if (this._context === undefined) {
            this._isCanceled = true;
        }
        else {
            // The task is started and has called TaskContext.nextTick()
            const context = this._context;
            console.assert(context._continue !== undefined);
            console.assert(context._cancel !== undefined);
            const _cancel = context._cancel;
            context._continue = undefined;
            context._cancel = undefined;
            // Rejects the Promise returned from the last TaskContext.nextTick() call
            // This should in turn reject or resolve the Promise returned by the task
            // function. If not it means the task caught the CancelError and ignored
            // it. If we can detect that case we should reject the _completed Promise
            // via _rejectCompleted().
            _cancel(new Error('Task canceled'));
        }
    }
}
//# sourceMappingURL=task.js.map