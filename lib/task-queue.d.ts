import { QueueScheduler } from './queue-scheduler.js';
import { TaskContext } from './task-context.js';
import { Task } from './task.js';
export declare class TaskQueue {
    readonly tasks: Set<TaskContext<any>>;
    readonly scheduler: QueueScheduler;
    constructor(scheduler: QueueScheduler);
    scheduleTask<T>(task: Task<T>): Promise<T>;
    removeTask(task: TaskContext<any>): void;
}
