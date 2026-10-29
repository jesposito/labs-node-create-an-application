const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const prettier = require('prettier');
const root = path.resolve(__dirname, '..');
async function completedSource() {
  let text = fs.readFileSync(path.join(root, 'src/web-app/index.js'), 'utf8');
  const config = JSON.parse(
    fs.readFileSync(path.join(root, 'package.json'))
  ).prettier;
  const tour = JSON.parse(
    fs.readFileSync(
      path.join(
        root,
        '.auth0/lab/guides/add-authentication-to-the-expenses-web-application.tour'
      )
    )
  );
  let edits = 0;
  for (const [i, s] of tour.steps.entries()) {
    // CodeTour strips the fence's final newline before replacing a selection.
    const block = s.description.match(/```[^\n]+\n(.+)\n```/ms);
    if (!block || s.file !== 'src/web-app/index.js') continue;
    const offset = (p) => {
      const lines = text.split('\n');
      return (
        lines.slice(0, p.line - 1).join('\n').length +
        (p.line > 1 ? 1 : 0) +
        Math.min(p.character - 1, lines[p.line - 1].length)
      );
    };
    const start = s.selection
      ? offset(s.selection.start)
      : offset({ line: s.line, character: 1 });
    const end = s.selection ? offset(s.selection.end) : start;
    text = text.slice(0, start) + block[1] + text.slice(end);
    new vm.Script(text, { filename: `tour-step-${i + 1}.js` });
    text = await prettier.format(text, { ...config, parser: 'babel' });
    edits++;
  }
  return { text, edits };
}
module.exports = { completedSource };
