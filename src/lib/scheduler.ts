import {QueueScheduler} from './queue-scheduler.js';
import {TaskQueue} from './task-queue.js';
import {Task} from './task.js';
import { LocalTaskQueue } from './local-task-queue.js';
import { WorkerTaskQueue } from './worker-task-queue.js';

/**
 * Maintains a set of queues, each with their own QueueScheduler to schedule
 * task execution.
 */
export class Scheduler {
  private _queues = new Map<string, TaskQueue<any>>();

  addLocalQueue(name: string, scheduler: QueueScheduler<any, any>) {
    const queue = new LocalTaskQueue(scheduler);
    // TODO(justinfagnani): Remove `any`
    this._queues.set(name, queue as any);
  }

  addWorkerQueue(name: string, scheduler: QueueScheduler<any, any>) {
    const queue = new WorkerTaskQueue(scheduler);
    // TODO(justinfagnani): Remove `any`
    this._queues.set(name, queue as any);
  }

  /**
   * Schedule a task on a named queue. The queue must already exist via a call
   * to `addQueue`.
   *
   * TODO: Accept a CancelToken
   */
  scheduleTask<T>(queueName: string, task: Task<T>): Promise<T> {
    const queue = this._queues.get(queueName);
    if (queue === undefined) {
      throw new Error(`No queue named ${queueName}`);
    }
    return queue.scheduleTask(task);
  }
}
