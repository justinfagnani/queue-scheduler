/**
 * A long-running task that yields to the Scheduler by awaiting on
 * TaskContext.prototype.nextTick(). Returns a Promise that resolves when the
 * task is complete.
 */
export declare type TaskFunction<T> = (taskContext: TaskContext) => Promise<T>;
/**
 * Maintains a set of queues, each with their own QueueScheduler to schedule
 * task execution.
 */
export declare class Scheduler {
    private _queues;
    addQueue(name: string, scheduler: QueueScheduler): void;
    /**
     * Schedule a task on a named queue. The queue must already exist via a call
     * to `addQueue`.
     *
     * TODO: Accept a CancelToken
     */
    scheduleTask<T>(queueName: string, task: TaskFunction<T>): Promise<T>;
}
export declare class TaskQueue {
    name: string;
    tasks: Set<Task<any>>;
    scheduler: QueueScheduler;
    constructor(scheduler: QueueScheduler);
    scheduleTask<T>(taskFn: TaskFunction<T>): Promise<T>;
    removeTask(task: Task<any>): void;
}
/**
 * An object that controls when tasks are executed from a queue or set of queues.
 */
export interface QueueScheduler {
    schedule(queue: TaskQueue): void;
}
export declare abstract class BaseQueueScheduler {
    protected _queues: Set<TaskQueue>;
    protected _queueIterator: Iterator<TaskQueue>;
    protected _queueData: WeakMap<TaskQueue, any>;
    protected _taskData: WeakMap<Task<any>, any>;
    protected _callbackId: number;
    protected _nextQueue: TaskQueue | null;
    nextTask: Task<any> | null;
    constructor();
    schedule(queue: TaskQueue): void;
    private _advanceQueue();
    advanceTask(): void;
    getTaskData(task: Task<any>): any;
    /**
     * Schedule a new callback of _execute. Returns a callback id.
     */
    protected abstract _schedule(): number;
    protected _execute(initialTimeRemaining: number): Promise<void>;
}
/**
 * A QueueScheduler that uses requestAnimationFrame timing.
 *
 * This scheduler tries to fit in as many task ticks as will fit in a frame. It
 * remembers the average time a tick takes per task and only executes a tick if it
 * thinks it'll fit in the remaining frame budget. It's a very simple estimate and
 * doesn't try to fit in faster tasks if a long one is next, so slow tasks can starve
 * fast ones.
 */
export declare class AnimationFrameQueueScheduler extends BaseQueueScheduler {
    /**
     * Time allocated to script execution per frame, in ms.
     */
    private _frameBudget;
    constructor(frameBudget?: number);
    protected _schedule(): number;
}
declare global  {
    interface IdleDeadline {
        timeRemaining(): number;
        didTimeout: boolean;
    }
    interface Window {
        requestIdleCallback(callback: (deadline: IdleDeadline) => void): number;
    }
}
/**
 * A QueueScheduler that uses requestIdleCallback timing.
 *
 * This scheduler tries to fit in as many task ticks as will fit under the extimated
 * time that the UA expects the user to remain idle.
 */
export declare class IdleQueueScheduler extends BaseQueueScheduler {
    protected _schedule(): number;
}
export declare class Task<T> {
    _taskFn: TaskFunction<T>;
    _queue: TaskQueue;
    _completed: Promise<T>;
    _resolveCompleted: (v: T) => void;
    _rejectCompleted: (err: any) => void;
    _context: TaskContext | null;
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
export declare class TaskContext {
    _continue: (() => void) | null;
    _cancel: ((error?: any) => void) | null;
    _yielded: Promise<boolean>;
    _yield: ((done: boolean) => void);
    _error: ((error?: any) => void);
    constructor();
    /**
     * Yields control back to the scheduler. Returns a Promise that resolves when
     * the scheduler continues the task, or rejects if the scheduler cancels the task.
     */
    nextTick(): Promise<void>;
}
export {};
