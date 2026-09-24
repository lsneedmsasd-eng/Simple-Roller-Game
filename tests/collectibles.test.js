const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sandbox = {
  console,
  Math,
  CONFIG: {
    TILE: 40,
    ROWS: 10,
    PIECE_COLS: 8,
    COLLECTIBLE_SIZE: 22,
  },
};

vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/level.js'), 'utf8'), sandbox);

const Level = sandbox.Level;
Level.pieces = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/pieces.json'), 'utf8'));
Level.levels = [{
  name: 'Collectible test',
  pieces: ['start', 'coinTrail', 'gemTrail', 'keyRoom'],
}];
Level.build(0);

assert.strictEqual(Level.collectibles.length, 8);
assert.deepStrictEqual(Level.collectibles.map((item) => item.kind), ['C', 'C', 'G', 'G', 'G', 'G', 'K']);

const first = Level.collectibles[0];
assert.strictEqual(Level.collectAt(first.x, first.y, first.width, first.height), 1);
assert.strictEqual(Level.collected, 1);
assert.strictEqual(Level.collectAt(first.x, first.y, first.width, first.height), 0);
assert.strictEqual(Level.collected, 1);

console.log('collectible behavior test passed');