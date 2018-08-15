import { TaskQueue } from './task-queue.js';
/**
 * An object that controls when tasks are executed from a queue or set of
 * queues.
 */
export interface QueueScheduler {
    schedule(queue: TaskQueue): void;
}
