import {QueueScheduler} from './queue-scheduler.js';
import {TaskFunction} from './task-function.js';
import {Task} from './task.js';

export class TaskQueue {
  name?: string;
  tasks = new Set<Task<any>>();
  scheduler: QueueScheduler;

  constructor(scheduler: QueueScheduler) { this.scheduler = scheduler; }

  scheduleTask<T>(taskFn: TaskFunction<T>): Promise<T> {
    const task = new Task(taskFn, this);
    this.tasks.add(task);
    this.scheduler.schedule(this);
    return task._completed;
  }

  removeTask(task: Task<any>) {
    console.assert(task._queue === this);
    this.tasks.delete(task);
  }
}
