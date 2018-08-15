import { QueueScheduler } from './queue-scheduler.js';
import { TaskFunction } from './task-function.js';
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
