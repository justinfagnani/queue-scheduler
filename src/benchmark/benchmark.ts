

const benchmarkAwait = async (n = 1000) => {
  for (let i = 0; i < n; i++) {
    await 0;
  }
}

const benchmarkTimeout = async (n = 1000) => {
  for (let i = 0; i < n; i++) {
    await new Promise((res) => setTimeout(res, 0));
  }
}

const benchmarkTimeout2 = async (n = 1000) => {
  for (let i = 0; i < n; i++) {
    await 0;
    await new Promise((res) => setTimeout(res, 0));
  }
}

const benchmarkPostMessage = async (n = 1000) => {
  let resolve: Function;

  window.addEventListener('message', () => {
    resolve();
  });

  for (let i = 0; i < n; i++) {
    await new Promise((res) => {
      resolve = res;
      postMessage('');
    });
  }
}

const runBenchmark = async (f: Function) => {
  const start = performance.now();
  await f();
  const end = performance.now();
  const duration = end - start;
  console.log(`${f.name}: ${duration}ms`);
  return duration;
};

(async () => {
  console.log('Starting benchmarks');
  await runBenchmark(benchmarkAwait);
  await runBenchmark(benchmarkTimeout);
  await runBenchmark(benchmarkTimeout2);
  await runBenchmark(benchmarkPostMessage);
})();
