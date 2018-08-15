import {QueueScheduler} from './queue-scheduler.js';
import {TaskQueue} from './task-queue.js';
import {Task} from './task.js';

/**
 * Maintains a set of queues, each with their own QueueScheduler to schedule
 * task execution.
 */
export class Scheduler {
  private _queues = new Map<string, TaskQueue>();

  addQueue(name: string, scheduler: QueueScheduler) {
    const queue = new TaskQueue(scheduler);
    this._queues.set(name, queue);
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
