import {TaskContext} from './task-context.js';

/**
 * A long-running task that yields to the Scheduler by awaiting on
 * TaskContext.prototype.nextTick(). Returns a Promise that resolves when the
 * task is complete.
 */
export type Task<T> = (taskContext: TaskContext<T>) => Promise<T>;
