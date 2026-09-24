const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sandbox = {
  console,
  Math,
  Level: { startX: 0, startY: 0 },
  CONFIG: {
    TILE: 40,
    PLAYER_SIZE: 32,
    PLAYER_RADIUS: 16,
    MOVE_SPEED: 0,
    JUMP_POWER: 15,
    GRAVITY: 0,
    MAX_FALL: 16,
    DASH_SPEED: 0,
    DASH_COOLDOWN: 12,
    DASH_DURATION: 6,
    CLIMB_SPEED: 4,
    ATTACK_DURATION: 8,
    ATTACK_COOLDOWN: 18,
    ATTACK_RANGE: 44,
    CANVAS_H: 400,
    MAX_OXYGEN: 3,
    OXYGEN_DRAIN: 1,
    OXYGEN_RECOVERY: 1,
    WATER_GRAVITY: 0,
  },
  Input: { left: false, right: false, up: false, down: false, jump: false, dash: false, attack: false },
  Collide: {
    hitsSolid: () => false,
    hitsLadder: () => false,
    hitsSpike: () => false,
    hitsEnemy: () => false,
    hitsWater: () => sandbox.inWater,
  },
  inWater: true,
};

vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/player.js'), 'utf8'), sandbox);
const Player = sandbox.Player;
Player.reset();

for (let frame = 0; frame < 3; frame += 1) Player.update();
assert.strictEqual(Player.oxygen, 0);
assert.strictEqual(Player.isDead(), true);
assert.strictEqual(Player.deathReason, 'oxygen');

sandbox.inWater = false;
Player.oxygen = 1;
Player.update();
assert.strictEqual(Player.oxygen, 2);

console.log('oxygen behavior test passed');