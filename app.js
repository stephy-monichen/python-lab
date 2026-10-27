/* Navigation, topic selection and wiring. Content comes from data/lessons.js. */
(() => {
  const $ = id => document.getElementById(id);
  const topics = TOPICS;
  let topic = topics.find(t => t.id === new URLSearchParams(location.search).get('topic')) || topics[0];
  const NAV = [['dashboard', '🏠', 'Dashboard'], ['learn', '📖', 'Learn'], ['explore', '🔬', 'Explore'], ['practice', '✏️', 'Practice'], ['build', '🛠️', 'Build'], ['code', '💻', 'Code'], ['badges', '🏅', 'Badges']];

  function refresh() {
    $('level').textContent = 'Level ' + Progress.level();
    $('xp').textContent = Progress.xp() + ' XP';
    $('xpBar').style.width = Progress.levelPct() + '%';
  }
  function go(v, arg) {
    document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.go === v));
    const view = $('view');
    $('workspace').hidden = true;
    view.innerHTML = Lessons[v === 'code' ? 'dashboard' : v](topic);
    if (v === 'explore') Lessons.bindExplore(topic);
    if (v === 'code') { view.innerHTML = ''; Challenge.playground(arg); }
    if (v === 'build') Challenge.open(topic.project);
    if (v === 'badges') $('resetProgress').onclick = () => { if (confirm('Erase all XP and badges in this browser?')) { Progress.reset(); refresh(); go('badges'); } };
    if (v !== 'build' && v !== 'code') window.scrollTo(0, 0);
  }

  $('nav').innerHTML = NAV.map(n => `<button data-go="${n[0]}">${n[1]} ${n[2]}</button>`).join('');
  $('view').addEventListener('click', e => {
    const g = e.target.closest('[data-go]'), t = e.target.closest('[data-try]'), x = e.target.closest('[data-ex]');
    if (g) go(g.dataset.go);
    if (t) go('code', topic.lessons[+t.dataset.try].code);
    if (x) Challenge.open(topic.exercises.find(c => c.id === x.dataset.ex));
  });
  $('nav').addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go); });

  if (topics.length > 1) {
    const s = $('topicSelect'); s.hidden = false;
    s.innerHTML = topics.map(t => `<option value="${t.id}"${t === topic ? ' selected' : ''}>${t.title}</option>`).join('');
    s.onchange = () => { location.search = '?topic=' + s.value; };
  }
  PyRunner.onStatus = s => {
    const p = $('pyStatus');
    p.textContent = { loading: 'Loading Python…', ready: 'Python ready', error: 'Python failed to load' }[s];
    p.className = 'pill ' + (s === 'ready' ? 'ok' : s === 'error' ? 'bad' : '');
  };
  window.App = { refresh, go };
  Challenge.setTopic(topic);
  refresh(); go('dashboard');
})();
