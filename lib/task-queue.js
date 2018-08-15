import { Task } from './task.js';
export class TaskQueue {
    constructor(scheduler) {
        this.tasks = new Set();
        this.scheduler = scheduler;
    }
    scheduleTask(taskFn) {
        const task = new Task(taskFn, this);
        this.tasks.add(task);
        this.scheduler.schedule(this);
        return task._completed;
    }
    removeTask(task) {
        console.assert(task._queue === this);
        this.tasks.delete(task);
    }
}
//# sourceMappingURL=task-queue.js.map