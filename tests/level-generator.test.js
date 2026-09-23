const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sandbox = {
  console,
  Math,
  CONFIG: { PIECE_COLS: 8 },
};

vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/level.js'), 'utf8'), sandbox);

const Level = sandbox.Level;
Level.levels = [];

const validPieces = new Set(['start', 'flat', 'gap', 'spikes', 'step', 'platform', 'stairs', 'spikepit', 'finish']);

for (let run = 0; run < 20; run += 1) {
  const levelNumber = Level.generateRandom();
  const generated = Level.levels[levelNumber];

  assert.strictEqual(generated.pieces[0], 'start');
  assert.strictEqual(generated.pieces[generated.pieces.length - 1], 'finish');
  assert.ok(generated.pieces.length >= 10 && generated.pieces.length <= 16);
  generated.pieces.forEach((pieceName) => assert.ok(validPieces.has(pieceName)));
}

console.log('random level generator test passed');