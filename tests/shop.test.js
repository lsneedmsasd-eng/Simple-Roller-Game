const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sandbox = {
  console,
  Game: undefined,
  Input: { restart: false, shopChoice: 0, shopContinue: false },
  Level: { collected: 2, updateEnemies() {} },
  Player: { update() {}, isDead: () => false, hasWon: () => true },
  document: { getElementById: () => ({ textContent: '' }) },
};

vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8'), sandbox);
const Game = sandbox.Game;
Game.completedLevels = 4;
Game.coins = 0;
Game.startRandomLevel = () => { Game.startedNextLevel = true; };
Game.update();

assert.strictEqual(Game.completedLevels, 5);
assert.strictEqual(Game.coins, 2);
assert.strictEqual(Game.mode, 'shop');

sandbox.Input.shopContinue = true;
Game.update();
assert.strictEqual(Game.startedNextLevel, true);

console.log('shop progression test passed');