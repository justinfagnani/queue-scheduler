import {TaskQueue} from './task-queue.js';
import { Task } from './task.js';

/**
 * An object that controls when tasks are executed from a queue or set of
 * queues.
 */
export interface QueueScheduler<Q extends TaskQueue<T>, T extends Task<any>> {
  schedule(queue: Q): void;
}
