const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sandbox = {
  console,
  Math,
  document: {
    getElementById: () => ({ textContent: '', hidden: false }),
  },
  window: { requestAnimationFrame: () => {} },
  Level: {
    build: () => { sandbox.levelBuildCount += 1; },
    startX: 0,
    startY: 0,
    generatedLevel: 0,
  },
  Player: {
    reset: () => { sandbox.playerResetCount += 1; },
    speedBonus: 0,
    jumpBonus: 0,
    maxOxygen: 100,
    oxygen: 100,
    attackFrames: 0,
    isAttacking: () => false,
    hasWon: () => false,
    isDead: () => false,
    x: 0,
    y: 0,
  },
  Input: { restart: true, shopChoice: 0, shopContinue: false },
  CONFIG: { MAX_OXYGEN: 100, START_LEVEL: 0, CANVAS_W: 800, CANVAS_H: 600 },
  Draw: { updateCamera: () => {}, everything: () => {} },
};
sandbox.levelBuildCount = 0;
sandbox.playerResetCount = 0;

vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8'), sandbox);
const Game = sandbox.Game;
Game.levelNumber = 7;
Game.startLevel(7);
Game.restartCurrentLevel();
assert.strictEqual(sandbox.levelBuildCount, 1, 'level should only build once when a level is first created');
assert.strictEqual(sandbox.playerResetCount, 2, 'restart should respawn the player without rebuilding the level');
console.log('restart current level test passed');
