const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sandbox = {
  console,
  CONFIG: { TILE: 40 },
  Level: {
    charAt: (col, row) => col === 1 && row === 1 ? '=' : '.',
    isSolid: (col, row) => false,
    isPlatform: (col, row) => col === 1 && row === 1,
  },
};

vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/collide.js'), 'utf8'), sandbox);
const Collide = sandbox.Collide;

assert.strictEqual(Collide.hitsSolid(40, 9, 32, 32, 8, 1, false), true);
assert.strictEqual(Collide.hitsSolid(40, 7, 32, 32, 8, -1, false), false);
assert.strictEqual(Collide.hitsSolid(40, 9, 32, 32, 8, 1, true), false);

console.log('one-way platform test passed');