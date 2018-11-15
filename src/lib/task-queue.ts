import {Task} from './task.js';

export interface TaskQueue<T extends Task<any>> {

  scheduleTask<T1 extends T & Task<R>, R>(task: T1): Promise<R>;

  removeTask(task: T): void;
}
