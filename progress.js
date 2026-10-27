/* Progress is saved in this browser only (localStorage). It does NOT sync between devices. */
const Progress = (() => {
  const KEY = 'pythonlab.v1';
  const fresh = () => ({ xp: 0, done: {}, badges: [] });
  let s;
  try { s = JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch (e) { s = fresh(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} };
  return {
    xp: () => s.xp,
    level: () => Math.floor(s.xp / 100) + 1,
    levelPct: () => s.xp % 100,
    isDone: id => !!s.done[id],
    hasBadge: b => s.badges.includes(b),
    // Returns true only the first time (so XP can't be farmed by repeating a challenge).
    complete(id, xp, badge) {
      if (s.done[id]) return false;
      s.done[id] = true; s.xp += xp;
      if (badge && !s.badges.includes(badge)) s.badges.push(badge);
      save(); return true;
    },
    reset() { s = fresh(); save(); }
  };
})();
