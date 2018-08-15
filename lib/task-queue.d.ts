import { QueueScheduler } from './queue-scheduler.js';
import { TaskFunction } from './task-function.js';
import { Task } from './task.js';
export declare class TaskQueue {
    name?: string;
    tasks: Set<Task<any>>;
    scheduler: QueueScheduler;
    constructor(scheduler: QueueScheduler);
    scheduleTask<T>(taskFn: TaskFunction<T>): Promise<T>;
    removeTask(task: Task<any>): void;
}
