/* =====================================================================
   player.js  --  THE ROLLING CIRCLE.

   This file owns everything about the player: where it is, how fast it
   is going, and what happens when it hits something.

   It does NOT draw anything. Drawing lives in js/draw.js.
   ===================================================================== */

var Player = {  
  x: 0,            // position in pixels, left edge of the box
  y: 0,            // position in pixels, top edge of the box
  vx: 0,           // speed left and right
  vy: 0,           // speed up and down
  onGround: false, // is the player standing on something right now?
  angle: 0,        // how far the circle has rolled, for drawing the dot
  dashCooldown: 0, // frames left before another dash can trigger
  dashFrames: 0,   // frames left in the current dash
  dashDirection: 0, // direction of the current dash
  facing: 1,
  attackCooldown: 0,
  attackFrames: 0,
  speedBonus: 0,
  jumpBonus: 0,
  maxOxygen: CONFIG.MAX_OXYGEN,
  oxygen: CONFIG.MAX_OXYGEN,
  deathReason: "",
  dropThroughFrames: 0
};

// Put the player back at the level's S square.
Player.reset = function () {
  Player.x = Level.startX;
  Player.y = Level.startY;
  Player.vx = 0;
  Player.vy = 0;
  Player.onGround = false;
  Player.angle = 0;
  Player.dashCooldown = 0;
  Player.dashFrames = 0;
  Player.dashDirection = 0;
  Player.facing = 1;
  Player.attackCooldown = 0;
  Player.attackFrames = 0;
  Player.oxygen = Player.maxOxygen;
  Player.deathReason = "";
  Player.dropThroughFrames = 0;
};

// Run one frame of player movement.
Player.update = function (deltaFrames) {
  deltaFrames = deltaFrames === undefined ? 1 : deltaFrames;
  var size = CONFIG.PLAYER_SIZE;
  Player.dropThroughFrames = Math.max(0, Player.dropThroughFrames - deltaFrames);

  Player.attackCooldown = Math.max(0, Player.attackCooldown - deltaFrames);
  Player.attackFrames = Math.max(0, Player.attackFrames - deltaFrames);
  if (Input.left) { Player.facing = -1; }
  if (Input.right) { Player.facing = 1; }
  if (Input.attack && Player.attackCooldown === 0) {
    Player.attackFrames = CONFIG.ATTACK_DURATION;
    Player.attackCooldown = CONFIG.ATTACK_COOLDOWN;
  }

  // --- 1. decide how fast to go sideways ------------------------------
  Player.dashCooldown = Math.max(0, Player.dashCooldown - deltaFrames);
  Player.dashFrames = Math.max(0, Player.dashFrames - deltaFrames);
  Player.vx = 0;

  if (Player.dashFrames > 0) {
    Player.vx = Player.dashDirection * CONFIG.DASH_SPEED * deltaFrames;
  } else if (Input.dash && Player.dashCooldown === 0) {
    var requestedDirection = 0;
    if (Input.left)  { requestedDirection = -1; }
    if (Input.right) { requestedDirection = 1; }
    if (requestedDirection !== 0) {
      Player.dashDirection = requestedDirection;
      Player.vx = requestedDirection * CONFIG.DASH_SPEED * deltaFrames;
      Player.dashFrames = CONFIG.DASH_DURATION;
      Player.dashCooldown = CONFIG.DASH_COOLDOWN;
    }
  }

  if (Player.vx === 0) {
    if (Input.left)  { Player.vx = -(CONFIG.MOVE_SPEED + Player.speedBonus) * deltaFrames; }
    if (Input.right) { Player.vx = (CONFIG.MOVE_SPEED + Player.speedBonus) * deltaFrames; }
  }

  // --- 2. jump, but only if we are standing on something --------------
  var onLadder = Collide.hitsLadder(Player.x, Player.y, size, size);
  var climbing = onLadder && (Input.up || Input.down);

  if (Input.down && Player.onGround && !onLadder) {
    Player.dropThroughFrames = 8;
    Player.onGround = false;
  }

  if (climbing) {
    Player.vy = (Input.up ? -CONFIG.CLIMB_SPEED : CONFIG.CLIMB_SPEED) * deltaFrames;
    Player.onGround = false;
  } else if (Input.jump && Player.onGround) {
    Player.vy = -(CONFIG.JUMP_POWER + Player.jumpBonus);   // negative is UP
    Player.onGround = false;
    var inWaterBeforeMove = Collide.hitsWater && Collide.hitsWater(Player.x, Player.y, size, size);
    Player.vy = Player.vy + (inWaterBeforeMove ? CONFIG.WATER_GRAVITY : CONFIG.GRAVITY) * deltaFrames;
  } else if (onLadder) {
    Player.vy = 0;
  } else {
    // --- 3. gravity pulls down every single frame ---------------------
    Player.vy = Player.vy + CONFIG.GRAVITY * deltaFrames;
    if (Player.vy > CONFIG.MAX_FALL * deltaFrames) { Player.vy = CONFIG.MAX_FALL * deltaFrames; }
  }

  // --- 4. move sideways, one pixel at a time, stopping at walls -------
  var stepX = 0;
  if (Player.vx > 0) { stepX = 1; }
  if (Player.vx < 0) { stepX = -1; }

  var remainingX = Math.abs(Player.vx);
  while (remainingX > 0) {
    var moveX = Math.min(1, remainingX) * stepX;
    if (Collide.hitsSolid(Player.x + moveX, Player.y, size, size)) { break; }
    Player.x = Player.x + moveX;
    Player.angle = Player.angle + moveX / CONFIG.PLAYER_RADIUS; // roll it
    remainingX -= Math.abs(moveX);
  }

  // --- 5. move up or down, one pixel at a time ------------------------
  var stepY = 0;
  if (Player.vy > 0) { stepY = 1; }
  if (Player.vy < 0) { stepY = -1; }

  Player.onGround = false;

  var remainingY = Math.abs(Player.vy);
  while (remainingY > 0) {
    var moveY = Math.min(1, remainingY) * stepY;
    if (Collide.hitsSolid(Player.x, Player.y + moveY, size, size, Player.y, stepY,
      Player.dropThroughFrames > 0)) {
      if (stepY > 0) { Player.onGround = true; }  // we landed on something
      Player.vy = 0;
      break;
    }
    Player.y = Player.y + moveY;
    remainingY -= Math.abs(moveY);
  }

  // --- 6. keep the player inside the left edge of the world -----------
  if (Player.x < 0) { Player.x = 0; }

  if (Player.attackFrames > 0 && Level.hitEnemies) {
    var attackX = Player.facing > 0 ? Player.x + size : Player.x - CONFIG.ATTACK_RANGE;
    Level.hitEnemies(attackX, Player.y + 6, CONFIG.ATTACK_RANGE, size - 12);
  }

  if (Level.collectAt) {
    Level.collectAt(Player.x, Player.y, size, size);
  }

  if (Collide.hitsWater && Collide.hitsWater(Player.x, Player.y, size, size)) {
    Player.oxygen = Math.max(0, Player.oxygen - CONFIG.OXYGEN_DRAIN * deltaFrames);
  } else {
    Player.oxygen = Math.min(Player.maxOxygen, Player.oxygen + CONFIG.OXYGEN_RECOVERY * deltaFrames);
  }
};

Player.isAttacking = function () { return Player.attackFrames > 0; };

// Did the player just touch something deadly?
Player.isDead = function () {
  var size = CONFIG.PLAYER_SIZE;
  if (Collide.hitsSpike(Player.x, Player.y, size, size)) { Player.deathReason = "spike"; return true; }
  if (Collide.hitsEnemy(Player.x, Player.y, size, size)) { Player.deathReason = "enemy"; return true; }
  if (Player.oxygen <= 0) { Player.deathReason = "oxygen"; return true; }
  if (Player.y > CONFIG.CANVAS_H + 200) { Player.deathReason = "fall"; return true; }
  return false;
};

// Did the player just reach the finish?
Player.hasWon = function () {
  var size = CONFIG.PLAYER_SIZE;
  return Collide.hitsFinish(Player.x, Player.y, size, size);
};
