import {QueueScheduler} from './queue-scheduler.js';
import {WorkerTask} from './task.js';
import { TaskQueue } from './task-queue.js';
import { WorkerTaskContext } from './worker-task-context.js';

export type WorkerQueueScheduler = QueueScheduler<WorkerTaskQueue, WorkerTask<any>>;

export class WorkerTaskQueue implements TaskQueue<WorkerTask<any>> {
  name?: string;
  tasks = new Set<WorkerTask<any>>();
  readonly contexts = new WeakMap<WorkerTask<any>, WorkerTaskContext<any>>();
  scheduler: WorkerQueueScheduler;

  constructor(scheduler: WorkerQueueScheduler) { this.scheduler = scheduler; }

  scheduleTask<T>(task: WorkerTask<T>): Promise<T> {
    const context = new WorkerTaskContext<T>(task);
    this.tasks.add(task);
    this.contexts.set(task, context);
    this.scheduler.schedule(this);
    return context.completed;
  }

  removeTask(task: WorkerTask<any>) {
    // console.assert(task._queue === this);
    this.tasks.delete(task);
  }
}

