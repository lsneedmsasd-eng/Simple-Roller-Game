const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sandbox = {
  console,
  Math,
  setTimeout,
  clearTimeout,
  window: {},
  Level: { startX: 0, startY: 0 },
  CONFIG: {
    PLAYER_SIZE: 32,
    PLAYER_RADIUS: 16,
    MOVE_SPEED: 4,
    JUMP_POWER: 15,
    GRAVITY: 0.8,
    MAX_FALL: 16,
    DASH_SPEED: 12,
    DASH_COOLDOWN: 12,
    DASH_DURATION: 6,
  },
  Input: { left: false, right: false, jump: false, dash: false },
  Collide: { hitsSolid() { return false; } },
};

vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/config.js'), 'utf8'), sandbox);
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/player.js'), 'utf8'), sandbox);

const Player = sandbox.Player;

function resetPlayer() {
  Player.reset();
  Player.onGround = true;
  sandbox.Input.left = false;
  sandbox.Input.right = false;
  sandbox.Input.jump = false;
  sandbox.Input.dash = false;
  Player.dashCooldown = 0;
}

resetPlayer();
sandbox.Input.right = true;
sandbox.Input.dash = true;
Player.update();
assert.strictEqual(Player.vx, sandbox.CONFIG.DASH_SPEED, 'dash should burst the player to the dash speed');
assert.ok(Player.dashCooldown > 0, 'dash should trigger a cooldown');

console.log('dash behavior test passed');
