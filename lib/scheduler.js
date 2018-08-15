import { TaskQueue } from './task-queue.js';
/**
 * Maintains a set of queues, each with their own QueueScheduler to schedule
 * task execution.
 */
export class Scheduler {
    constructor() {
        this._queues = new Map();
    }
    addQueue(name, scheduler) {
        const queue = new TaskQueue(scheduler);
        this._queues.set(name, queue);
    }
    /**
     * Schedule a task on a named queue. The queue must already exist via a call
     * to `addQueue`.
     *
     * TODO: Accept a CancelToken
     */
    scheduleTask(queueName, task) {
        const queue = this._queues.get(queueName);
        if (queue === undefined) {
            throw new Error(`No queue named ${queueName}`);
        }
        return queue.scheduleTask(task);
    }
}
//# sourceMappingURL=scheduler.js.map