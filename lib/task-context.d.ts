import { Task } from './task.js';
export declare class TaskContext<T> {
    private _task;
    private _state;
    /**
     * Controls the Promise returned by completed. Resolves when the task returns.
     */
    private _completedDeferred;
    /**
     * Controls the Promise returned by the last call to yield(). Resolves when
     * the task should continue.
     */
    private _continueDeferred?;
    private _yieldDeferred?;
    constructor(task: Task<T>);
    readonly completed: Promise<T>;
    /**
     * Yields control back to the scheduler. Returns a Promise that resolves when
     * the scheduler continues the task, or rejects if the scheduler cancels the
     * task.
     */
    yield(): Promise<void>;
    /**
     * Continues or starts this task.
     *
     * _continue() starts a task function by invoking it, and continues a task by
     * resolving the Promise returned from the last TaskContext.yield() call.
     *
     * Returns a Promise that resolves when the task yields.
     */
    continue(): Promise<boolean>;
    /**
     * Cancels a running task by rejecting the Promise returned from yield().
     */
    cancel(): void;
}
