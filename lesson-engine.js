/* Builds the HTML for Dashboard, Learn, Explore, Practice, Build and Badges from a topic object. */
const Lessons = (() => {
  const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const $ = id => document.getElementById(id);
  const done = (t, id) => Progress.isDone(t.id + ':' + id);

  function dashboard(t) {
    const p = t.exercises.filter(e => done(t, e.id)).length;
    const stages = [
      ['learn', '📖 Learn', t.lessons.length + ' short lessons'],
      ['explore', '🔬 Explore', done(t, 'explore') ? 'Completed ✔' : 'Interactive demo'],
      ['practice', '✏️ Practice', p + ' of ' + t.exercises.length + ' done'],
      ['build', '🛠️ Build', done(t, t.project.id) ? 'Completed ✔' : t.project.title],
      ['code', '💻 Code', 'Free Python editor']];
    return `<div class="card"><h1>${t.icon} ${t.title}</h1><p>${t.description}</p>
      <p class="mut">${t.level} · about ${t.minutes} minutes</p><h3>By the end you can</h3>
      <ul>${t.objectives.map(o => `<li>${o}</li>`).join('')}</ul>
      <p class="mut">Progress is saved in this browser only and does not sync between devices.</p></div>
      <div class="grid">${stages.map(s => `<button class="stage card" data-go="${s[0]}"><h3>${s[1]}</h3><span class="mut">${s[2]}</span></button>`).join('')}</div>`;
  }

  function learn(t) {
    return `<div class="card hint">${t.browserNote}</div>` + t.lessons.map((l, i) => `<div class="card">
      <h2>${i + 1}. ${l.title}</h2>${l.text.map(x => `<p>${x}</p>`).join('')}
      <pre class="code">${esc(l.code)}</pre><p>${l.explain}</p>
      <button data-try="${i}">▶ Try it in the editor</button></div>`).join('');
  }

  function explore() {
    return `<div class="card"><h2>🔬 File mode simulator</h2>
      <p>Pick a mode and an action, then see what happens to <code>notes.txt</code>. Try all three modes to earn a badge.</p>
      <div class="row">
        <label>Mode <select id="xMode"><option value="r">r — read</option><option value="w">w — write</option><option value="a">a — append</option></select></label>
        <label>Action <select id="xAct"><option value="read">f.read()</option><option value="write">f.write("New line")</option></select></label>
        <label><input type="checkbox" id="xExists" checked> notes.txt exists</label>
        <button id="xGo" class="primary">Simulate</button><button id="xReal">Run real Python</button></div>
      <pre class="code" id="xCode"></pre>
      <div class="two"><div><b>Before</b><pre class="code" id="xBefore"></pre></div><div><b>After</b><pre class="code" id="xAfter"></pre></div></div>
      <div id="xMsg"></div><pre class="term" id="xOut" hidden></pre></div>`;
  }

  const BEFORE = 'Line 1\nLine 2\n';
  function sim(m, a, ex) {
    const before = ex ? BEFORE : null;
    if (m === 'r' && !ex) return { after: before, err: 'FileNotFoundError — "r" never creates a file.' };
    if (m === 'r' && a === 'write') return { after: before, err: 'UnsupportedOperation: not writable — "r" is read-only.' };
    const after = m === 'w' ? '' : (before ?? '');           // "w" erases the file the moment it opens
    if (m !== 'r' && a === 'read') return { after, err: `UnsupportedOperation: not readable — "${m}" is write-only.` + (m === 'w' ? ' And the old content is already gone!' : '') };
    return a === 'write' ? { after: after + 'New line\n' } : { after, note: 'print() shows the whole file.' };
  }

  function bindExplore(t) {
    const tried = new Set();
    const show = (b, x) => (x === null ? '(no file)' : x === '' ? '(empty file)' : x);
    const state = () => ({ m: $('xMode').value, a: $('xAct').value, ex: $('xExists').checked });
    const code = (m, a) => `f = open("notes.txt", "${m}")\n` + (a === 'read' ? 'print(f.read())' : 'f.write("New line\\n")') + '\nf.close()';
    function badge(m) {
      tried.add(m);
      if (tried.size === 3 && Progress.complete(t.id + ':explore', 10, 'mode-master')) { $('xMsg').innerHTML += '<p><b>🏅 Mode Master unlocked! +10 XP</b></p>'; App.refresh(); }
    }
    $('xGo').onclick = () => {
      const { m, a, ex } = state(), r = sim(m, a, ex);
      $('xCode').textContent = code(m, a);
      $('xBefore').textContent = show(0, ex ? BEFORE : null);
      $('xAfter').textContent = show(0, r.after);
      $('xMsg').innerHTML = r.err ? `<p><b style="color:var(--err)">❌ ${r.err}</b></p>` : `<p><b style="color:var(--ok)">✅ Works.</b> ${r.note || ''}</p>`;
      badge(m);
    };
    $('xReal').onclick = async () => {
      if (!PyRunner.ready) { $('xMsg').textContent = 'Python is still loading…'; return; }
      const { m, a, ex } = state(), o = $('xOut'); o.hidden = false; o.textContent = 'Running…';
      try {
        const r = await PyRunner.run({ code: code(m, a), files: ex ? { 'notes.txt': BEFORE } : {}, reset: true });
        o.textContent = (r.out || '(no output)') + '\n— notes.txt afterwards: ' + show(0, r.files['notes.txt'] ?? null);
      } catch (e) { o.textContent = e.message; }
      badge(m);
    };
  }

  function practice(t) {
    return `<div class="grid">${t.exercises.map(e => `<button class="stage card" data-ex="${e.id}"><h3>${e.title}</h3>
      <span class="pill">${e.level}</span> <span class="pill">${e.xp} XP</span><p>${done(t, e.id) ? '✔ Completed' : 'Not completed yet'}</p></button>`).join('')}</div>`;
  }
  function build(t) {
    const p = t.project;
    return `<div class="card"><h2>🛠️ ${p.title}</h2><p>${p.intro}</p><p class="mut">Reward: ${p.xp} XP${done(t, p.id) ? ' · ✔ Completed' : ''}</p></div>`;
  }
  function badges(t) {
    return `<div class="grid">${t.badges.map(b => `<div class="card ${Progress.hasBadge(b.id) ? '' : 'locked'}"><div class="badge">${b.icon}</div>
      <b>${b.name}</b><br><span class="mut">${b.desc}</span></div>`).join('')}</div>
      <p><button id="resetProgress">Reset my progress</button> <span class="mut">Progress is stored only in this browser.</span></p>`;
  }
  return { dashboard, learn, explore, practice, build, badges, bindExplore };
})();
