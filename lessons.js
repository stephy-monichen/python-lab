/* All teaching content lives here. To add a topic, add another object to TOPICS — no engine changes needed
   (the Explore demo is chosen by `explore.type`; see js/lesson-engine.js). */
const R = String.raw;   // String.raw keeps "\n" as two characters inside Python code samples

/* ---- test helpers ---- */
const fileLines = s => (s || '').split('\n').map(x => x.trim()).filter(Boolean);
const outLines = s => s.trimEnd().split('\n').map(x => x.trimEnd());
// Compare two lists of lines; returns null if equal, else a friendly message.
const diffLines = (got, exp) => {
  for (let i = 0; i < Math.max(got.length, exp.length); i++) {
    if (got[i] !== exp[i]) {
      let m = `Line ${i + 1}: expected ${JSON.stringify(exp[i] ?? '(nothing)')} but got ${JSON.stringify(got[i] ?? '(nothing)')}.`;
      if (got[i] === '') m += ' Extra blank line? Each line read from a file ends with \\n — try .strip().';
      return m;
    }
  }
  return null;
};
const need = (r, name) => r.files[name] === undefined ? `${name} was not created. Did you open it in a mode that creates files?` : null;

const TOPICS = [{
  id: 'file-handling', icon: '📁', title: 'File Handling', level: 'Beginner', minutes: 60,
  description: 'Programs forget everything when they stop. Files let your program save information and read it back later.',
  objectives: [
    'Open a file with <code>open()</code> and the <code>with</code> statement',
    'Choose the right mode: <code>"r"</code>, <code>"w"</code> or <code>"a"</code>',
    'Read a file line by line and clean each line with <code>.strip()</code>',
    'Write new files and append to existing ones without losing data',
    'Handle a missing file with <code>try / except FileNotFoundError</code>'
  ],
  browserNote: 'Files in Python Lab live in a <b>virtual folder inside your browser</b>. They are real files for Python, but they disappear when you reload the page.',

  lessons: [
    { title: 'Why files?', text: [
        'Variables live in memory. When the program stops, they are gone — like writing on a whiteboard and then wiping it.',
        'A file is like a notebook: what you write stays there, and your program can read it tomorrow.'],
      code: R`with open("hello.txt", "w") as f:
    f.write("Hello from Python!\n")
print("Saved!")`,
      explain: '<code>open("hello.txt", "w")</code> opens (and creates) a file for writing. <code>f.write()</code> puts text inside. <code>\\n</code> means “start a new line”.' },
    { title: 'Opening files: modes and <code>with</code>', text: [
        'The second item in <code>open()</code> is the <b>mode</b>: <code>"r"</code> read (default), <code>"w"</code> write (erases old content!), <code>"a"</code> append (adds to the end).',
        'Use <code>with</code>: Python closes the file for you, even if something goes wrong.'],
      code: R`with open("hello.txt", "w") as f:
    f.write("first\n")
with open("hello.txt", "r") as f:
    print(f.read())`,
      explain: 'The first block writes, the second block reads the whole file back as one string.' },
    { title: 'Reading line by line', text: [
        'A file can be looped over like a list. Every line still has a hidden <code>\\n</code> at the end, so use <code>.strip()</code> to remove it.'],
      code: R`with open("fruits.txt", "w") as f:
    f.write("apple\nmango\nbanana\n")

with open("fruits.txt") as f:
    for line in f:
        print(line.strip())`,
      explain: 'Try removing <code>.strip()</code> and see the extra blank lines appear.' },
    { title: 'Write vs append', text: [
        '<code>"w"</code> starts fresh every time. <code>"a"</code> keeps what is already there and adds new text at the end.'],
      code: R`with open("log.txt", "w") as f:
    f.write("start\n")
with open("log.txt", "a") as f:
    f.write("one more\n")
with open("log.txt", "w") as f:
    f.write("oops, erased!\n")
print(open("log.txt").read())`,
      explain: 'Only the last <code>"w"</code> survives. Change it to <code>"a"</code> to keep everything.' },
    { title: 'When the file is missing', text: [
        'Reading a file that does not exist crashes with <code>FileNotFoundError</code>. Catch it and give a friendly message instead.'],
      code: R`try:
    with open("secret.txt") as f:
        print(f.read())
except FileNotFoundError:
    print("secret.txt does not exist yet")`,
      explain: 'The program keeps running instead of crashing. Create <code>secret.txt</code> first and run again.' }
  ],

  explore: { type: 'fileModes' },

  exercises: [
    { id: 'ex1', level: 'Easy', title: 'Write a greeting', xp: 20, badge: 'first-file',
      prompt: 'Create a file called <code>greeting.txt</code> containing <code>Hello, file!</code>, then read it back and print it.',
      starter: `# Step 1: open greeting.txt in write mode and write the text\n# Step 2: open it again in read mode and print what is inside\n`,
      files: {}, skills: ['open()', 'write mode', 'read()'],
      hints: ['Use <code>with open("greeting.txt", "w") as f:</code> and then <code>f.write(...)</code>.', 'Reading uses a second <code>with</code> block with mode <code>"r"</code> (or no mode).', 'Inside the second block: <code>print(f.read())</code>.'],
      tests: [{ name: 'Creates greeting.txt and prints it', files: {}, check: r =>
        need(r, 'greeting.txt') || (r.files['greeting.txt'].trim() !== 'Hello, file!' ? `greeting.txt contains ${JSON.stringify(r.files['greeting.txt'])}; it should contain exactly Hello, file!` : null)
        || (!r.out.includes('Hello, file!') ? 'The file is right. Now print what you read back from it.' : null) }],
      next: 'Next up: reading a file line by line.' },
    { id: 'ex2', level: 'Medium', title: 'Numbered names', xp: 30, badge: 'line-reader',
      prompt: '<code>names.txt</code> already exists, one name per line. Complete the code to print each name with a number: <code>1. Asha</code>, <code>2. Ben</code>… It must work for any names.txt.',
      starter: `# names.txt already exists. Fix the code so it prints:\n# 1. Asha\n# 2. Ben\n# 3. Chitra\nwith open("names.txt") as f:\n    for number, line in ____:\n        print(____)\n`,
      files: { 'names.txt': 'Asha\nBen\nChitra\n' }, skills: ['looping over a file', '.strip()', 'enumerate'],
      hints: ['<code>enumerate(f, start=1)</code> gives a counter and a line together.', 'Each line ends with <code>\\n</code>. Use <code>line.strip()</code>.', 'Print with an f-string: <code>f"{number}. {line.strip()}"</code>.'],
      tests: [
        { name: 'Asha, Ben, Chitra', files: { 'names.txt': 'Asha\nBen\nChitra\n' }, check: r => diffLines(outLines(r.out), ['1. Asha', '2. Ben', '3. Chitra']) },
        { name: 'Different file: Zoe, Liam', files: { 'names.txt': 'Zoe\nLiam\n' }, check: r => diffLines(outLines(r.out), ['1. Zoe', '2. Liam']) }],
      next: 'Next up: adding to a file without erasing it.' },
    { id: 'ex3', level: 'Hard', title: 'Visitor log', xp: 50, badge: 'logbook-keeper',
      prompt: 'Ask for a visitor name with <code>input()</code>, add it to the end of <code>visitors.txt</code> (keep the old names!), then print <code>Total visitors: N</code>. The file may not exist the first time.',
      starter: `name = input("Visitor name: ")\n\n# 1. Add the name to visitors.txt without erasing old names\n# 2. Read the file and count the visitors\n# 3. Print: Total visitors: <number>\n`,
      files: { 'visitors.txt': 'Asha\nBen\n' }, stdin: 'Chitra', skills: ['append mode', 'input()', 'counting lines', 'combining read + write'],
      hints: ['Append mode is <code>"a"</code>. It also creates the file if it is missing.', 'Write <code>name + "\\n"</code> so each visitor gets their own line.', 'After writing, open the file with <code>"r"</code> and use <code>len(f.readlines())</code>.'],
      tests: [
        { name: 'Adds to an existing list', stdin: 'Chitra', files: { 'visitors.txt': 'Asha\nBen\n' }, check: r => {
          const n = need(r, 'visitors.txt'); if (n) return n;
          const l = fileLines(r.files['visitors.txt']);
          if (!l.includes('Asha') || !l.includes('Ben')) return 'Old names were erased. Which mode keeps old content?';
          return diffLines(l, ['Asha', 'Ben', 'Chitra']) || (/\b3\b/.test(r.out) ? null : 'Print the total, e.g. Total visitors: 3'); } },
        { name: 'Works when the file does not exist yet', stdin: 'Dev', files: {}, check: r =>
          need(r, 'visitors.txt') || diffLines(fileLines(r.files['visitors.txt']), ['Dev']) || (/\b1\b/.test(r.out) ? null : 'Print the total, e.g. Total visitors: 1') }],
      next: 'You are ready for the mini-project!' }
  ],

  project: { id: 'organizer', level: 'Final project', title: 'Text File Organizer', xp: 100, badge: 'file-organizer',
    intro: 'Sort a messy inbox into tidy files — one file per category. This is also the final assessment: it uses reading, writing and error handling together.',
    prompt: '<code>inbox.txt</code> has lines like <code>fruit: apple</code>. Create one file per category (<code>fruit.txt</code>, <code>veggie.txt</code>…) with its items, one per line. Skip blank lines. Print <code>Organized 3 items into 2 files</code>. If inbox.txt is missing, print <code>inbox.txt not found</code>.',
    starter: `# Text File Organizer\n# inbox.txt lines look like:  fruit: apple\n\ntry:\n    with open("inbox.txt") as inbox:\n        pass  # your code here\nexcept FileNotFoundError:\n    print("inbox.txt not found")\n`,
    files: { 'inbox.txt': 'fruit: apple\nveggie: carrot\nfruit: mango\n' },
    skills: ['reading files', 'splitting text', 'writing several files', 'error handling'],
    hints: ['For each line: skip it if <code>line.strip()</code> is empty, then <code>category, item = line.split(":")</code>.', 'Remember to <code>.strip()</code> the category and the item.', 'Append each item to <code>category + ".txt"</code> with mode <code>"a"</code>. Because the folder starts clean, append is safe. Keep a set of categories and a counter for the final message.'],
    tests: [
      { name: 'Sorts fruit and veggies', files: { 'inbox.txt': 'fruit: apple\nveggie: carrot\nfruit: mango\n' }, check: r =>
        need(r, 'fruit.txt') || need(r, 'veggie.txt') || diffLines(fileLines(r.files['fruit.txt']), ['apple', 'mango']) || diffLines(fileLines(r.files['veggie.txt']), ['carrot'])
        || (/Organized 3 items into 2 files/.test(r.out) ? null : 'Final message should be: Organized 3 items into 2 files') },
      { name: 'Ignores blank lines', files: { 'inbox.txt': 'drink: tea\n\ndrink: coffee\n' }, check: r =>
        need(r, 'drink.txt') || diffLines(fileLines(r.files['drink.txt']), ['tea', 'coffee']) || (/Organized 2 items into 1 file/.test(r.out) ? null : 'Final message should be: Organized 2 items into 1 file') },
      { name: 'Missing inbox.txt does not crash', files: {}, check: r => r.ok && r.out.includes('inbox.txt not found') ? null : 'If inbox.txt is missing, catch FileNotFoundError and print: inbox.txt not found' }],
    next: 'Bonus ideas: handle upper/lower-case categories, or add an index.txt listing every file you made.' },

  playground: `# Free editor: experiment! Files you create stay until you reload or press "Delete files".\nwith open("notes.txt", "a") as f:\n    f.write("My first note\\n")\n\nprint(open("notes.txt").read())\n`,

  badges: [
    { id: 'mode-master', icon: '🔬', name: 'Mode Master', desc: 'Tried r, w and a in the simulator' },
    { id: 'first-file', icon: '📄', name: 'First File', desc: 'Wrote and read your first file' },
    { id: 'line-reader', icon: '🔍', name: 'Line Reader', desc: 'Looped over a file line by line' },
    { id: 'logbook-keeper', icon: '📒', name: 'Logbook Keeper', desc: 'Appended without erasing' },
    { id: 'file-organizer', icon: '🗂️', name: 'File Organizer', desc: 'Finished the final project' }
  ]
}];
