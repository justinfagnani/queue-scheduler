import { TaskContext } from './task-context.js';
import { TaskFunction } from './task-function.js';
import { TaskQueue } from './task-queue.js';
export declare class Task<T> {
    _taskFn: TaskFunction<T>;
    _queue: TaskQueue;
    _completed: Promise<T>;
    _resolveCompleted: (v: T) => void;
    _rejectCompleted: (err: any) => void;
    _context: TaskContext | undefined;
    _isComplete: boolean;
    _isCanceled: boolean;
    constructor(taskFn: TaskFunction<T>, queue: TaskQueue);
    readonly completed: Promise<T>;
    /**
     * Continues or starts this task.
     *
     * _continue() starts a task function by invoking it, and continues a task by
     * resolving the Promise returned from the last TaskContext.nextTick() call.
     *
     * Returns a Promise that resolves when the task yields.
     */
    _continue(): Promise<boolean>;
    cancel(): void;
}
