/* Runs Python (Pyodide) in a Web Worker so an infinite loop can be stopped by terminating the worker. */
importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');

const SETUP = String.raw`
import sys, io, os, json, gc, builtins, traceback

def _run(code, stdin_text, files_json, reset):
    if reset:                                   # start from a clean folder
        for f in os.listdir('.'):
            if os.path.isfile(f): os.remove(f)
    for name, text in json.loads(files_json).items():   # create the exercise's starting files
        with open(name, 'w') as fh: fh.write(text)
    lines = iter(stdin_text.split('\n')) if stdin_text else iter([])
    out = io.StringIO()
    def fake_input(prompt=''):                  # browsers have no terminal, so input() reads the Input box
        out.write(str(prompt))
        try: value = next(lines)
        except StopIteration: raise EOFError('input() was called but the Input box has no more lines')
        out.write(value + '\n')
        return value
    saved = (sys.stdout, sys.stderr, builtins.input)
    sys.stdout = sys.stderr = out
    builtins.input = fake_input
    ok = True
    g = {}
    try:
        g = {'__name__': '__main__'}
        exec(compile(code, 'main.py', 'exec'), g)
    except SystemExit:
        pass
    except BaseException as e:
        ok = False
        tb = e.__traceback__.tb_next if e.__traceback__ else None   # hide our own wrapper frame
        traceback.print_exception(type(e), e, tb)
    finally:
        sys.stdout, sys.stderr, builtins.input = saved
        g.clear()                               # drop the student's variables so unclosed files get flushed
    gc.collect()                                # closes files the student forgot to close, so we can read them
    found = {}
    for f in sorted(os.listdir('.')):
        if os.path.isfile(f):
            try:
                with open(f) as fh: found[f] = fh.read()
            except Exception: pass
    return json.dumps({'ok': ok, 'out': out.getvalue(), 'files': found})
`;

let run;
(async () => {
  try {
    const py = await loadPyodide();
    await py.runPythonAsync(SETUP);
    run = py.globals.get('_run');
    postMessage({ type: 'ready' });
  } catch (e) { postMessage({ type: 'initerror', message: String(e) }); }
})();

onmessage = e => {
  const { code, stdin, files, reset } = e.data;
  try {
    const r = JSON.parse(run(code, stdin || '', JSON.stringify(files || {}), !!reset));
    postMessage({ type: 'result', ...r });
  } catch (err) { postMessage({ type: 'error', message: String(err) }); }
};
