export declare class TaskContext {
    _continue: (() => void) | undefined;
    _cancel: ((error?: any) => void) | undefined;
    _yielded: Promise<boolean>;
    _yield: ((done: boolean) => void);
    _error: ((error?: any) => void);
    constructor();
    /**
     * Yields control back to the scheduler. Returns a Promise that resolves when
     * the scheduler continues the task, or rejects if the scheduler cancels the
     * task.
     */
    nextTick(): Promise<void>;
}
