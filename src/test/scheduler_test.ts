import {AnimationFrameQueueScheduler, Scheduler, TaskContext} from '../scheduler.js';
// import {assert} from 'chai';

declare let assert: any;

suite('scheduler', () => {

  let scheduler: Scheduler;

  setup(() => {
    scheduler = new Scheduler();
  })

  test('a task is executed', async () => {

    scheduler.addQueue('test', new AnimationFrameQueueScheduler());

    const result = await scheduler.scheduleTask('test', async (context: TaskContext) => {
      console.log('task started');
      for (let i = 0; i < 25; i++) {
        await context.nextTick();
        let time = performance.now();
        console.log('iteration', i, time);
      }
      return 42;
    });
    assert.equal(42, result);

  });

});
