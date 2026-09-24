/* =====================================================================
   draw.js  --  EVERYTHING YOU CAN SEE.

   Nothing in this file changes the game. It only puts pixels on screen.
   If you want to change how the game LOOKS, this is the only file you
   need. If you want to change how it BEHAVES, this is the wrong file.

   The whole game is black and white on purpose. That is your room to
   work in.
   ===================================================================== */

var Draw = {
  canvas: null,
  ctx: null,
  cameraX: 0     // how far the view has scrolled to the right
};

Draw.setup = function () {
  Draw.canvas = document.getElementById("game");
  Draw.ctx = Draw.canvas.getContext("2d");
};

// Follow the player, but never scroll past the ends of the level.
Draw.updateCamera = function () {
  Draw.cameraX = Player.x - CONFIG.CANVAS_W / 2;
  if (Draw.cameraX < 0) { Draw.cameraX = 0; }

  var furthest = Level.pixelWidth() - CONFIG.CANVAS_W;
  if (furthest < 0) { furthest = 0; }   // level narrower than the screen
  if (Draw.cameraX > furthest) { Draw.cameraX = furthest; }
};

// Draw one whole frame.
Draw.everything = function () {
  var ctx = Draw.ctx;

  // 1. wipe the screen white
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);

  // 2. shift everything left so the camera looks like it moved right
  ctx.save();
  ctx.translate(-Draw.cameraX, 0);

  Draw.world();
  Draw.player();

  ctx.restore();
  Draw.hud();
};

// Draw every grid square that is currently on screen.
Draw.world = function () {
  var ctx = Draw.ctx;
  var size = CONFIG.TILE;

  // only look at the columns that are actually visible. much faster.
  var firstCol = Math.floor(Draw.cameraX / size) - 1;
  var lastCol  = firstCol + Math.ceil(CONFIG.CANVAS_W / size) + 2;

  for (var row = 0; row < CONFIG.ROWS; row++) {
    for (var col = firstCol; col <= lastCol; col++) {
      var here = Level.charAt(col, row);
      var x = col * size;
      var y = row * size;

      if (here === "#") { Draw.block(x, y, size); }
      if (here === "^") { Draw.spike(x, y, size); }
      if (here === "L") { Draw.ladder(x, y, size); }
      if (here === "*" || here === "+" || here === "~") { Draw.decor(x, y, size, here); }
      if (here === "F") { Draw.finish(x, y, size); }
    }
  }

  for (var enemyIndex = 0; enemyIndex < Level.enemies.length; enemyIndex++) {
    var enemy = Level.enemies[enemyIndex];
    if (!enemy.defeated) { Draw.enemy(enemy.x, enemy.y, size, enemy.kind); }
  }

  for (var collectibleIndex = 0; collectibleIndex < Level.collectibles.length; collectibleIndex++) {
    var collectible = Level.collectibles[collectibleIndex];
    if (!collectible.collected) {
      Draw.collectible(collectible.x, collectible.y, collectible.width, collectible.kind);
    }
  }
};

// A solid block: white inside, black outline.
Draw.block = function (x, y, size) {
  var ctx = Draw.ctx;
  ctx.fillStyle = "#ff0000";
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = CONFIG.LINE_WIDTH;
  ctx.strokeRect(x + CONFIG.LINE_WIDTH / 2,
                 y + CONFIG.LINE_WIDTH / 2,
                 size - CONFIG.LINE_WIDTH,
                 size - CONFIG.LINE_WIDTH);
};

// A spike: a solid black triangle pointing up.
Draw.spike = function (x, y, size) {
  var ctx = Draw.ctx;
  ctx.fillStyle = "#ff0000";
  ctx.beginPath();
  ctx.moveTo(x, y + size);
  ctx.lineTo(x + size / 2, y);
  ctx.lineTo(x + size, y + size);
  ctx.closePath();
  ctx.fill();
};

Draw.ladder = function (x, y, size) {
  var ctx = Draw.ctx;
  ctx.strokeStyle = "#ff0000";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + 10, y + 2);
  ctx.lineTo(x + 10, y + size - 2);
  ctx.moveTo(x + size - 10, y + 2);
  ctx.lineTo(x + size - 10, y + size - 2);
  ctx.moveTo(x + 10, y + 10);
  ctx.lineTo(x + size - 10, y + 10);
  ctx.moveTo(x + 10, y + size / 2);
  ctx.lineTo(x + size - 10, y + size / 2);
  ctx.moveTo(x + 10, y + size - 10);
  ctx.lineTo(x + size - 10, y + size - 10);
  ctx.stroke();
};

Draw.decor = function (x, y, size, kind) {
  var ctx = Draw.ctx;
  ctx.fillStyle = kind === "~" ? "#7a0000" : "#ff0000";
  if (kind === "*") {
    ctx.fillRect(x + 8, y + 20, 4, 12);
    ctx.fillRect(x + 20, y + 12, 4, 20);
    ctx.fillRect(x + 28, y + 24, 4, 8);
  } else if (kind === "+") {
    ctx.fillRect(x + 8, y + 12, 24, 6);
    ctx.fillRect(x + 17, y + 4, 6, 28);
  } else {
    ctx.fillRect(x, y + 26, size, 6);
    ctx.fillRect(x + 8, y + 18, 24, 8);
  }
};

Draw.enemy = function (x, y, size, kind) {
  var ctx = Draw.ctx;
  ctx.fillStyle = "#ff0000";
  if (kind === "B") {
    ctx.beginPath();
    ctx.moveTo(x + size / 2, y + 4);
    ctx.lineTo(x + size - 2, y + size - 8);
    ctx.lineTo(x + size / 2, y + size - 14);
    ctx.lineTo(x + 2, y + size - 8);
    ctx.closePath();
    ctx.fill();
  } else {
    var inset = kind === "H" ? 2 : 6;
    ctx.fillRect(x + inset, y + 6, size - inset * 2, size - 6);
  }
  ctx.fillStyle = "#000000";
  ctx.fillRect(x + 10, y + 14, 4, 4);
  ctx.fillRect(x + size - 14, y + 14, 4, 4);
};

Draw.collectible = function (x, y, size, kind) {
  var ctx = Draw.ctx;
  ctx.fillStyle = kind === "G" ? "#00ffff" : kind === "K" ? "#ffff00" : "#ffffff";
  ctx.strokeStyle = "#ff0000";
  ctx.lineWidth = 3;
  if (kind === "G") {
    ctx.beginPath();
    ctx.moveTo(x + size / 2, y);
    ctx.lineTo(x + size, y + size / 2);
    ctx.lineTo(x + size / 2, y + size);
    ctx.lineTo(x, y + size / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (kind === "K") {
    ctx.beginPath();
    ctx.arc(x + size / 2 - 3, y + size / 2, size / 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillRect(x + size / 2, y + size / 2 - 2, size / 2, 4);
    ctx.fillRect(x + size - 5, y + size / 2 + 2, 4, 6);
  } else {
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
};

Draw.hud = function () {
  var ctx = Draw.ctx;
  ctx.fillStyle = "#ffffff";
  ctx.font = "16px monospace";
  ctx.fillText("COLLECTED " + Level.collected + "/" + Level.collectibles.length, 12, 24);
};

// The finish: a black pole with a flag on it.
Draw.finish = function (x, y, size) {
  var ctx = Draw.ctx;
  ctx.fillStyle = "#ff0000";
  ctx.fillRect(x + size / 2 - 2, y, 4, size);
  ctx.beginPath();
  ctx.moveTo(x + size / 2 + 2, y + 4);
  ctx.lineTo(x + size - 4,     y + 12);
  ctx.lineTo(x + size / 2 + 2, y + 20);
  ctx.closePath();
  ctx.fill();
};

// The player: a white circle with a black outline and one off-center
// black dot, so you can see it roll.
Draw.player = function () {
  var ctx = Draw.ctx;
  var r = CONFIG.PLAYER_RADIUS;
  var centerX = Player.x + CONFIG.PLAYER_SIZE / 2;
  var centerY = Player.y + CONFIG.PLAYER_SIZE / 2;

  // the circle
  ctx.fillStyle = "#ff0000";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = CONFIG.LINE_WIDTH;
  ctx.beginPath();
  ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (Player.isAttacking()) {
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 5;
    ctx.beginPath();
    var attackStart = Player.facing > 0 ? centerX + r : centerX - r;
    var attackEnd = Player.facing > 0 ? attackStart + 28 : attackStart - 28;
    ctx.moveTo(attackStart, centerY - 10);
    ctx.lineTo(attackEnd, centerY + 10);
    ctx.stroke();
  }

  // the off-center dot. its position depends on how far we have rolled.
  var dotX = centerX + Math.cos(Player.angle) * r * CONFIG.DOT_DISTANCE;
  var dotY = centerY + Math.sin(Player.angle) * r * CONFIG.DOT_DISTANCE;

  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
  ctx.fill();
};
