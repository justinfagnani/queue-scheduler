import { TaskContext } from './task-context.js';
export class TaskQueue {
    constructor(scheduler) {
        this.tasks = new Set();
        this.scheduler = scheduler;
    }
    scheduleTask(task) {
        const context = new TaskContext(task);
        this.tasks.add(context);
        // Make sure the scheduler knows to schedule this queue
        this.scheduler.schedule(this);
        return context.completed;
    }
    removeTask(task) {
        console.assert(this.tasks.has(task));
        this.tasks.delete(task);
    }
}
//# sourceMappingURL=task-queue.js.map