import {AnimationFrameQueueScheduler, IdleQueueScheduler, Scheduler, TaskContext} from '../scheduler.js';
// import {assert} from 'chai';

declare let assert: any;

suite('scheduler', () => {

  let scheduler: Scheduler;

  setup(() => {
    scheduler = new Scheduler();
  })

  test('a task is executed', async () => {

    scheduler.addQueue('test', new AnimationFrameQueueScheduler());
    const task = async (context: TaskContext) => {
      console.log('task started');
      for (let i = 0; i < 25; i++) {
        await context.nextTick();
        let time = performance.now();
        console.log('iteration', i, time);
      }
      return 42;
    };
    const result = await scheduler.scheduleTask('test', task);
    assert.equal(42, result);

  });

  test('two tasks are executed concurrently', async () => {

    scheduler.addQueue('test', new AnimationFrameQueueScheduler());

    const task1 = async (context: TaskContext) => {
      console.log('task1 started');
      for (let i = 0; i < 25; i++) {
        await context.nextTick();
        let time = performance.now();
        console.log('task1 iteration', i, time);
      }
      return 42;
    };
    const task2 = async (context: TaskContext) => {
      console.log('task2 started');
      for (let i = 0; i < 25; i++) {
        await context.nextTick();
        let time = performance.now();
        console.log('task2 iteration', i, time);
      }
      return 99;
    };

    const [result1, result2] = await Promise.all([
      scheduler.scheduleTask('test', task1),
      scheduler.scheduleTask('test', task2),
    ]);
    assert.equal(42, result1);
    assert.equal(99, result2);

  });

  suite('IdleQueueScheduler', async () => {

    test('executes a task', async () => {

      scheduler.addQueue('idle', new IdleQueueScheduler());
      const task = async (context: TaskContext) => {
        console.log('task started');
        for (let i = 0; i < 25; i++) {
          await context.nextTick();
          let time = performance.now();
          console.log('iteration', i, time);
        }
        return 42;
      };
      const result = await scheduler.scheduleTask('idle', task);
      assert.equal(42, result);
    });

  });

});
