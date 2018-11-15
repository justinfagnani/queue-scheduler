import {LocalTaskContext} from './task-context.js';

export type Task<T> = LocalTask<T>|WorkerTask<T>;

/**
 * A long-running task that yields to the Scheduler by awaiting on
 * TaskContext.prototype.nextTick(). Returns a Promise that resolves when the
 * task is complete.
 */
export type LocalTask<T> = (taskContext: LocalTaskContext<T>) => T|Promise<T>;

export interface WorkerTask<_T> {
  import: string;
  function: string;
  args: any[];
}
