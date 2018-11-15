import {QueueScheduler} from './queue-scheduler.js';
import {LocalTaskContext} from './task-context.js';
import {LocalTask} from './task.js';
import { TaskQueue } from './task-queue.js';

export type LocalQueueScheduler = QueueScheduler<LocalTaskQueue, LocalTask<any>>;

export class LocalTaskQueue implements TaskQueue<LocalTask<any>> {
  readonly tasks = new Set<LocalTask<any>>();
  readonly contexts = new WeakMap<LocalTask<any>, LocalTaskContext<any>>();
  readonly scheduler: LocalQueueScheduler;

  constructor(scheduler: LocalQueueScheduler) { this.scheduler = scheduler; }

  scheduleTask<T extends LocalTask<R>, R>(task: T): Promise<R> {
    const context = new LocalTaskContext(task);
    this.tasks.add(task);
    this.contexts.set(task, context);

    // Make sure the scheduler knows to schedule this queue
    this.scheduler.schedule(this);
    return context.completed;
  }

  removeTask(task: LocalTask<any>) {
    console.assert(this.tasks.has(task));
    this.tasks.delete(task);
  }
}
