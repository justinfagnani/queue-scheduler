export class BaseQueueScheduler {
    constructor() {
        this._queues = new Set();
        this._queueData = new WeakMap();
        this._taskData = new WeakMap();
        this._callbackId = 0;
        this._queueIterator = this._queues.values();
    }
    schedule(queue) {
        this._queues.add(queue);
        if (!this._queueData.has(queue)) {
            this._queueData.set(queue, {
                taskIterator: queue.tasks.values(),
            });
        }
        if (this._nextTask === undefined) {
            this.advanceTask();
        }
        if (this._nextTask !== undefined && this._callbackId === 0) {
            this._callbackId = this._schedule();
        }
    }
    _advanceQueue() {
        if (this._queues.size === 0) {
            this._nextQueue = undefined;
            return;
        }
        let next = this._queueIterator.next();
        if (next.done) {
            // Reached the end of the queues iterator, start from beginning
            this._queueIterator = this._queues.values();
            next = this._queueIterator.next();
        }
        console.assert(!next.done);
        this._nextQueue = next.value;
    }
    advanceTask() {
        this._advanceQueue();
        const queue = this._nextQueue;
        if (queue === undefined) {
            this._nextTask = undefined;
            return;
        }
        if (queue.tasks.size === 0) {
            this._nextTask = undefined;
            return;
        }
        const queueData = this._queueData.get(queue);
        let next = queueData.taskIterator.next();
        if (next.done) {
            queueData.taskIterator = queue.tasks.values();
            next = queueData.taskIterator.next();
        }
        console.assert(!next.done);
        this._nextTask = next.value;
    }
    getTaskData(task) {
        let taskData = this._taskData.get(task);
        if (taskData === undefined) {
            taskData = {
                tickCount: 0,
                avgTickDuration: 0,
            };
            this._taskData.set(task, taskData);
        }
        return taskData;
    }
    async _execute(initialTimeRemaining) {
        console.log(`BaseQueueScheduler._execute ${initialTimeRemaining}`);
        // Mark that we don't have a scheduled callback
        this._callbackId = 0;
        const estimatedEnd = performance.now() + initialTimeRemaining;
        let tasksExecuted = 0;
        while (this._nextTask) {
            const task = this._nextTask;
            const taskData = this.getTaskData(task);
            const start = performance.now();
            const timeRemaining = estimatedEnd - start;
            // Always execute at least one task, or if we think there's enough time
            // left in the frame
            if (tasksExecuted === 0 || timeRemaining >= taskData.avgTickDuration) {
                tasksExecuted++;
                this.advanceTask();
                const done = await task.continue();
                const end = performance.now();
                const duration = end - start;
                taskData.avgTickDuration =
                    (taskData.avgTickDuration * taskData.tickCount + duration) /
                        ++taskData.tickCount;
                if (done) {
                    // clean up task
                    // const queue = task._queue;
                    const queue = this._nextQueue;
                    queue.removeTask(task);
                    if (this._nextTask === task) {
                        this.advanceTask();
                    }
                }
            }
            else {
                break;
            }
        }
        if (this._nextTask !== undefined && this._callbackId === 0) {
            this._callbackId = this._schedule();
        }
    }
}
//# sourceMappingURL=base-queue-scheduler.js.map