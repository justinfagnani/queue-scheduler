import {QueueScheduler} from './queue-scheduler.js';
import {TaskContext} from './task-context.js';
import {Task} from './task.js';

export class TaskQueue {
  readonly tasks = new Set<TaskContext<any>>();
  readonly scheduler: QueueScheduler;

  constructor(scheduler: QueueScheduler) { this.scheduler = scheduler; }

  scheduleTask<T>(task: Task<T>): Promise<T> {
    const context = new TaskContext(task);
    this.tasks.add(context);

    // Make sure the scheduler knows to schedule this queue
    this.scheduler.schedule(this);
    return context.completed;
  }

  removeTask(task: TaskContext<any>) {
    console.assert(this.tasks.has(task));
    this.tasks.delete(task);
  }
}
