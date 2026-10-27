# Python Lab — Learn, Code, Build

A static website (no backend, no accounts) that teaches Python in the browser with Pyodide and CodeMirror.
Current topic: **File Handling** (beginner, about 60 minutes).

## Run locally
Web Workers need a web server (double-clicking index.html will not work):

    cd python-lab
    python -m http.server 8000      # then open http://localhost:8000

The first load downloads Pyodide (about 10 MB) from a CDN, so an internet connection is required.

## Publish on GitHub Pages
    git init && git add . && git commit -m "Add Python Lab: File Handling"
    git branch -M main
    git remote add origin https://github.com/<your-user>/python-lab.git
    git push -u origin main
Then: repository **Settings → Pages → Build from branch → main / (root)**. Your site appears at `https://<your-user>.github.io/python-lab/`.

## How it works
| File | Job |
|---|---|
| `data/lessons.js` | **All topic content**: lessons, exercises, project, hints, tests, badges, XP |
| `js/pyworker.js` | Runs Python in a Web Worker; `input()` reads the Input box; reports files left behind |
| `js/python-runner.js` | Talks to the worker; stops runs after 6 s (infinite loops) and restarts Python |
| `js/challenge-engine.js` | Editor, Run, Check my solution, hints, completion screen |
| `js/lesson-engine.js` | Dashboard, Learn, Explore (file-mode simulator), Practice, Build, Badges |
| `js/progress.js` | XP, levels, badges in `localStorage` (this browser only, no sync) |

Tests run the student's program with fixed inputs and starting files, then check the printed output **and the files it created**. Several tests use different data so hard-coded answers fail.

## Add a new topic
Add another object to `TOPICS` in `data/lessons.js` (same shape as File Handling). A topic selector appears automatically when there is more than one topic. Topic-specific Explore demos are chosen by `explore.type`; add a new one in `js/lesson-engine.js`.

## Notes
- Files exist only in an in-browser virtual folder and vanish on reload.
- The final project doubles as the final assessment.
