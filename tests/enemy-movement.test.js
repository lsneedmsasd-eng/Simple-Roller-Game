const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sandbox = {
  console,
  Math,
  CONFIG: { TILE: 40, ROWS: 3, PIECE_COLS: 8, ENEMY_SIZE: 32 },
};

vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/level.js'), 'utf8'), sandbox);
const Level = sandbox.Level;
Level.grid = ['........', '........', '########'];
Level.cols = 8;
Level.enemies = [{
  x: 80, y: 48, width: 32, height: 32, kind: 'E', speed: 1.5,
  direction: 1, baseY: 48, phase: 0, defeated: false,
}];

const startingX = Level.enemies[0].x;
Level.updateEnemies();
assert.notStrictEqual(Level.enemies[0].x, startingX);

console.log('enemy movement test passed');