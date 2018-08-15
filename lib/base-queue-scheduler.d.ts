import { TaskContext } from './task-context.js';
import { TaskQueue } from './task-queue.js';
export declare abstract class BaseQueueScheduler {
    protected _queues: Set<TaskQueue>;
    protected _queueIterator: Iterator<TaskQueue>;
    protected _queueData: WeakMap<TaskQueue, any>;
    protected _taskData: WeakMap<TaskContext<any>, any>;
    protected _callbackId: number;
    protected _nextQueue?: TaskQueue;
    protected _nextTask?: TaskContext<any>;
    constructor();
    schedule(queue: TaskQueue): void;
    private _advanceQueue;
    advanceTask(): void;
    getTaskData(task: TaskContext<any>): any;
    /**
     * Schedule a new callback of _execute. Returns a callback id.
     */
    protected abstract _schedule(): number;
    protected _execute(initialTimeRemaining: number): Promise<void>;
}
