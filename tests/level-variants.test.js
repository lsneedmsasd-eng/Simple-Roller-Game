const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sandbox = {
  console,
  Math,
  CONFIG: { PIECE_COLS: 8, ROWS: 10, TILE: 40 },
  Level: { levels: [] },
};

vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/level.js'), 'utf8'), sandbox);
const Level = sandbox.Level;
Level.levels = [];

const upsideDownLevel = Level.generateRandom(9, 'upsideDown');
assert.strictEqual(Level.levels[upsideDownLevel].variant, 'upsideDown');
assert.ok(Level.levels[upsideDownLevel].pieces.length >= 10);

const icyLevel = Level.generateRandom(10, 'icy');
assert.strictEqual(Level.levels[icyLevel].variant, 'icy');
assert.ok(Level.levels[icyLevel].pieces.length >= 10);

console.log('level variants test passed');
