/* The shared coding workspace: editor, Run, tests, hints, completion screen. Used by Practice, Build and Code. */
const Challenge = (() => {
  const $ = id => document.getElementById(id);
  const TIPS = [[/FileNotFoundError/, 'Python can’t find that file. Check the spelling, or create it first with mode "w" or "a".'],
    [/not writable/, 'You opened the file for reading. Use "w" or "a" to write.'], [/not readable/, 'You opened the file for writing only. Use "r" to read.'],
    [/EOFError/, 'Your program called input(). Type the answer in the Input box first.'], [/SyntaxError/, 'Python can’t read this code. Look for a blank ____ you still need to fill, or a missing colon or quote.']];
  let topic, cur, editor, hintN = 0;

  function ensureEditor() {
    if (editor) return;
    if (window.CodeMirror) {
      const cm = CodeMirror($('editorBox'), { mode: 'python', theme: 'material-darker', lineNumbers: true, indentUnit: 4,
        extraKeys: { Tab: c => c.somethingSelected() ? c.indentSelection('add') : c.replaceSelection('    ') } });
      editor = { get: () => cm.getValue(), set: v => { cm.setValue(v); setTimeout(() => cm.refresh(), 0); } };
    } else {                                      // fallback if the CDN is blocked
      const t = document.createElement('textarea'); t.rows = 14; t.spellcheck = false; $('editorBox').appendChild(t);
      editor = { get: () => t.value, set: v => { t.value = v; } };
    }
  }
  const busy = b => ['runBtn', 'testBtn', 'wipeBtn'].forEach(i => { $(i).disabled = b; });
  function out(text, err) { const o = $('output'); o.textContent = text; o.className = 'term' + (err ? ' err' : ''); }
  function showFiles(files) {
    const n = Object.keys(files || {});
    $('files').innerHTML = n.length ? '<h3>Files in the virtual folder</h3><div class="two">' + n.map(k => `<div><b>${k}</b><pre class="code"></pre></div>`).join('') + '</div>' : '';
    n.forEach((k, i) => { $('files').querySelectorAll('pre')[i].textContent = files[k] === '' ? '(empty)' : files[k]; });
  }

  function load(c, free) {
    ensureEditor(); cur = c; hintN = 0;
    $('workspace').hidden = false;
    $('task').innerHTML = `<h2>${c.title}${c.level ? ` <span class="pill">${c.level} · ${c.xp} XP</span>` : ''}</h2><p>${c.prompt}</p>`;
    editor.set(c.starter); $('stdin').value = c.stdin || ''; $('stdinBox').open = !!c.stdin;
    $('hints').innerHTML = $('results').innerHTML = $('files').innerHTML = '';
    out('Output appears here.');
    $('testBtn').hidden = $('hintBtn').hidden = free; $('wipeBtn').hidden = !free;
    $('workspace').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function setTopic(t) { topic = t; }
  function open(c) { load(Object.assign({ reset: true }, c), false); }
  function playground(code) { load({ title: '💻 Free Python editor', prompt: 'Experiment freely. Files you create stay available between runs until you reload the page.', starter: code || topic.playground, files: {}, reset: false }, true); }

  async function run() {
    if (!PyRunner.ready) { out('Python is still loading — try again in a moment.'); return; }
    busy(true); out('Running…'); $('results').innerHTML = '';
    try {
      const r = await PyRunner.run({ code: editor.get(), stdin: $('stdin').value, files: cur.files || {}, reset: cur.reset });
      let text = r.out || '(no output)';
      const tip = TIPS.find(t => t[0].test(r.out));
      if (!r.ok && tip) text += '\n\n💡 ' + tip[1];
      out(text, !r.ok); showFiles(r.files);
    } catch (e) { out(e.message, true); }
    busy(false);
  }

  async function runTests() {
    if (!PyRunner.ready) { out('Python is still loading — try again in a moment.'); return; }
    busy(true); $('results').innerHTML = '<p>Running tests…</p>';
    let html = '', pass = 0;
    for (const t of cur.tests) {
      let msg;
      try {
        const r = await PyRunner.run({ code: editor.get(), stdin: t.stdin || '', files: t.files || {}, reset: true });
        msg = r.ok || t.allowCrash ? t.check(r) : 'Your program crashed: ' + r.out.trim().split('\n').pop();
      } catch (e) { msg = e.message; }
      if (!msg) pass++;
      html += `<div class="test ${msg ? 'fail' : 'pass'}">${msg ? '❌' : '✅'} <b>${t.name}</b>${msg ? '<br>' + msg.replace(/</g, '&lt;') : ''}</div>`;
    }
    html = `<h3>${pass} of ${cur.tests.length} tests passed</h3>` + html;
    if (pass === cur.tests.length) {
      const first = Progress.complete(topic.id + ':' + cur.id, cur.xp, cur.badge), b = topic.badges.find(x => x.id === cur.badge);
      html += `<div class="card win"><h2>🎉 Challenge complete!</h2><p>${first ? '<b>+' + cur.xp + ' XP</b>' : 'Already completed earlier — no extra XP.'}
        ${b ? `· ${b.icon} Badge: <b>${b.name}</b>` : ''}</p><p>Skills used: ${cur.skills.join(', ')}.</p><p>${cur.next}</p></div>`;
      App.refresh();
    } else html += '<p class="mut">Read the messages above, fix your code, and check again. Need help? Use the hint button.</p>';
    $('results').innerHTML = html; busy(false);
  }

  function hint() {
    if (hintN < cur.hints.length) hintN++;
    $('hints').innerHTML = cur.hints.slice(0, hintN).map((h, i) => `<div class="hint"><b>Hint ${i + 1}:</b> ${h}</div>`).join('') +
      (hintN === cur.hints.length ? '<p class="mut">No more hints. Re-read the error message and your output carefully.</p>' : '');
  }
  async function wipe() { busy(true); try { await PyRunner.run({ code: '', reset: true }); showFiles({}); out('Files deleted.'); } catch (e) { out(e.message, true); } busy(false); }

  $('runBtn').onclick = run; $('testBtn').onclick = runTests; $('hintBtn').onclick = hint; $('wipeBtn').onclick = wipe;
  $('resetBtn').onclick = () => cur && editor.set(cur.starter);
  $('clearBtn').onclick = () => out('Output appears here.');
  return { setTopic, open, playground };
})();
