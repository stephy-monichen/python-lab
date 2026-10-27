/* Main-thread wrapper around the Pyodide worker. Adds a timeout that restarts Python if a program never ends. */
const PyRunner = (() => {
  let worker, readyP, onReady, isReady = false;
  const api = { onStatus() {}, get ready() { return isReady; } };
  function start() {
    isReady = false; api.onStatus('loading');
    readyP = new Promise(r => { onReady = r; });
    worker = new Worker('js/pyworker.js');
    worker.onmessage = e => {
      if (e.data.type === 'ready') { isReady = true; api.onStatus('ready'); onReady(); }
      else if (e.data.type === 'initerror') api.onStatus('error');
    };
  }
  // job = {code, stdin, files, reset}; resolves to {ok, out, files}
  api.run = async (job, timeoutMs = 6000) => {
    await readyP;
    const w = worker;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        w.terminate(); start();
        reject(new Error('⏱ Stopped after ' + timeoutMs / 1000 + ' seconds. Does a loop never end? (Python is restarting — wait a moment, then try again.)'));
      }, timeoutMs);
      w.onmessage = e => {
        const m = e.data;
        if (m.type === 'result') { clearTimeout(timer); resolve(m); }
        else if (m.type === 'error') { clearTimeout(timer); reject(new Error(m.message)); }
      };
      w.postMessage(job);
    });
  };
  start();
  return api;
})();
