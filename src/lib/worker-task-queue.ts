import {QueueScheduler} from './queue-scheduler.js';
import {TaskFunction} from './task-function.js';
import {LocalTaskInfo} from './task.js';
import { WorkerTask } from './worker-task.js';

export class WorkerTaskQueue {
  name?: string;
  tasks = new Set<WorkerTask>();
  scheduler: QueueScheduler;

  constructor(scheduler: QueueScheduler) { this.scheduler = scheduler; }

  scheduleTask<T>(task: WorkerTask): Promise<T> {
    this.tasks.add(task);
    this.scheduler.schedule(this);
    return task._completed;
  }

  removeTask(task: LocalTaskInfo<any>) {
    console.assert(task._queue === this);
    this.tasks.delete(task);
  }
}
