import { WorkerTask } from './task.js';

export class WorkerTaskContext<T> {
  task: WorkerTask<any>;
  completed!: Promise<T>;

  constructor(task: WorkerTask<any>) {
    console.log(task);
    this.task = task;
  }
}
