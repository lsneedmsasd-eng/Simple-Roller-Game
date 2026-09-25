/* =====================================================================
   level.js  --  BUILDING THE WORLD OUT OF PIECES.

   A level is a list of piece names. A piece is a little 8-wide,
   10-tall picture. This file glues the pictures together, left to
   right, into one big grid.

   The pictures live in data/pieces.json.
   The lists of names live in data/levels.json.
   ===================================================================== */

var Level = {
  pieces: null,     // every piece picture, loaded from pieces.json
  levels: null,     // every level list, loaded from levels.json
  grid: [],         // the finished world. grid[row][col] is one character
  cols: 0,          // how many columns wide the finished world is
  name: "",
  enemies: [],      // moving enemies spawned from enemy tiles
  collectibles: [], // pickups spawned from collectible tiles
  collected: 0,
  enemyFrame: 0,
  startX: 0,        // where the player begins, in pixels
  startY: 0
};

// --- STEP 1: read the two data files ----------------------------------
Level.loadData = function (whenDone) {
  fetch("data/pieces.json")
    .then(function (r) { return r.json(); })
    .then(function (piecesFile) {
      Level.pieces = piecesFile;
      return fetch("data/levels.json");
    })
    .then(function (r) { return r.json(); })
    .then(function (levelsFile) {
      Level.levels = levelsFile.levels;
      whenDone();
    })
    .catch(function (error) {
      document.getElementById("message").textContent =
        "Could not load the level files. Check data/pieces.json and data/levels.json.";
      console.error(error);
    });
};

Level.generateRandom = function () {
  var safePieces = ["flat", "step", "platform", "stairs", "ladder", "vertical", "terrain", "bridge", "cave", "decor", "rollingHills", "marsh", "crystalCave", "coinTrail", "gemTrail", "keyRoom", "water"];
  var challengePieces = ["gap", "spikes", "spikepit", "enemy", "runner", "bat", "brute"];
  var pieces = ["start", "decor", "ladder"];
  var previousWasChallenge = false;
  var middleCount = 6 + Math.floor(Math.random() * 5);

  for (var i = 0; i < middleCount; i++) {
    var choices = previousWasChallenge ? safePieces : safePieces.concat(challengePieces);
    var pieceName = choices[Math.floor(Math.random() * choices.length)];
    pieces.push(pieceName);
    previousWasChallenge = challengePieces.indexOf(pieceName) >= 0;
  }

  pieces.push("vertical");
  pieces.push("flat");
  var enemyPieces = ["enemy", "runner", "bat", "brute"];
  pieces.push(enemyPieces[Math.floor(Math.random() * enemyPieces.length)]);
  var finishName = Level.levels.length % 2 === 0 ? "finishHigh" : "finish";
  pieces.push(finishName);
  Level.levels.push({
    name: "Random Run " + (Level.levels.length - 1),
    pieces: pieces,
    procedural: true
  });
  return Level.levels.length - 1;
};

// --- STEP 2: glue the pieces together ---------------------------------
Level.build = function (levelNumber) {
  var level = Level.levels[levelNumber];
  Level.name = level.name;
  Level.grid = [];
  Level.cols = level.pieces.length * CONFIG.PIECE_COLS;

  // start with 10 empty rows
  for (var row = 0; row < CONFIG.ROWS; row++) {
    Level.grid.push("");
  }

  // add each piece onto the end of every row
  for (var p = 0; p < level.pieces.length; p++) {
    var pieceName = level.pieces[p];
    var piece = Level.pieces[pieceName];

    if (!piece) {
      console.error("No piece named '" + pieceName + "' in data/pieces.json");
      piece = Level.pieces["flat"];
    }

    for (var row = 0; row < CONFIG.ROWS; row++) {
      Level.grid[row] = Level.grid[row] + piece[row];
    }
  }

  if (level.procedural) { Level.randomizeWorld(); }

  Level.findStart();
  Level.spawnEnemies();
  Level.spawnCollectibles();
};

// Give generated levels a new silhouette and a different set of landmarks.
// The hand-authored levels remain exactly as designed in pieces.json.
Level.randomizeWorld = function () {
  var floorRow = 8;
  var nextFloor = 7 + Math.floor(Math.random() * 3);
  var protectedColumns = {};

  for (var row = 0; row < CONFIG.ROWS; row++) {
    for (var col = 0; col < Level.cols; col++) {
      if (Level.charAt(col, row) === "S" || Level.charAt(col, row) === "F") {
        protectedColumns[col] = true;
      }
    }
  }

  // A random walk creates flats, ramps, hills, ledges, and occasional pits.
  for (var column = 0; column < Level.cols; column++) {
    var isGap = !protectedColumns[column] && Math.random() < 0.06;
    if (!protectedColumns[column] && Math.random() < 0.18) {
      nextFloor += Math.floor(Math.random() * 3) - 1;
    }
    nextFloor = Math.max(5, Math.min(floorRow, nextFloor));
    if (protectedColumns[column]) { nextFloor = floorRow; }

    for (var groundRow = floorRow; groundRow < CONFIG.ROWS; groundRow++) {
      Level.grid[groundRow] = Level.grid[groundRow].substring(0, column) +
        (groundRow >= nextFloor && !isGap ? "#" : ".") + Level.grid[groundRow].substring(column + 1);
    }
  }

  // Add sparse, different landmarks to empty air without replacing gameplay tiles.
  for (var landmarkColumn = 3; landmarkColumn < Level.cols - 3; landmarkColumn += 2 + Math.floor(Math.random() * 5)) {
    if (protectedColumns[landmarkColumn] || Math.random() < 0.35) { continue; }
    var landmarkHeight = 1 + Math.floor(Math.random() * 3);
    var topRow = 7 - landmarkHeight;
    if (Level.charAt(landmarkColumn, topRow) !== ".") { continue; }
    for (var landmarkRow = topRow; landmarkRow < 7; landmarkRow++) {
      if (Level.charAt(landmarkColumn, landmarkRow) === ".") {
        Level.grid[landmarkRow] = Level.grid[landmarkRow].substring(0, landmarkColumn) + "#" +
          Level.grid[landmarkRow].substring(landmarkColumn + 1);
      }
    }
    if (Math.random() < 0.5 && Level.charAt(landmarkColumn + 1, topRow) === ".") {
      Level.grid[topRow] = Level.grid[topRow].substring(0, landmarkColumn + 1) + "=" +
        Level.grid[topRow].substring(landmarkColumn + 2);
    }
  }
};

Level.spawnCollectibles = function () {
  Level.collectibles = [];
  Level.collected = 0;
  for (var row = 0; row < CONFIG.ROWS; row++) {
    for (var col = 0; col < Level.cols; col++) {
      var kind = Level.charAt(col, row);
      if (!Level.isCollectibleChar(kind)) { continue; }
      Level.collectibles.push({
        x: col * CONFIG.TILE + CONFIG.TILE / 2 - CONFIG.COLLECTIBLE_SIZE / 2,
        y: row * CONFIG.TILE + CONFIG.TILE / 2 - CONFIG.COLLECTIBLE_SIZE / 2,
        width: CONFIG.COLLECTIBLE_SIZE,
        height: CONFIG.COLLECTIBLE_SIZE,
        kind: kind,
        collected: false
      });
    }
  }
};

Level.collectAt = function (x, y, width, height) {
  var collectedNow = 0;
  for (var i = 0; i < Level.collectibles.length; i++) {
    var collectible = Level.collectibles[i];
    if (collectible.collected) { continue; }
    if (x < collectible.x + collectible.width && x + width > collectible.x &&
        y < collectible.y + collectible.height && y + height > collectible.y) {
      collectible.collected = true;
      collectedNow++;
    }
  }
  Level.collected += collectedNow;
  return collectedNow;
};

Level.spawnEnemies = function () {
  Level.enemies = [];
  Level.enemyFrame = 0;
  for (var row = 0; row < CONFIG.ROWS; row++) {
    for (var col = 0; col < Level.cols; col++) {
      var kind = Level.charAt(col, row);
      if (!Level.isEnemyChar(kind)) { continue; }
      var supportRow = row + 1;
      while (supportRow < CONFIG.ROWS && !Level.isSolid(col, supportRow)) {
        supportRow++;
      }
      if (supportRow >= CONFIG.ROWS) { continue; }
      var speed = 1.5;
      if (kind === "M") { speed = 2.5; }
      if (kind === "B") { speed = 1.8; }
      if (kind === "H") { speed = 0.8; }
      if (typeof Game !== "undefined" && Game.settings && Game.settings.hardMode) { speed += 0.7; }
      Level.enemies.push({
        x: col * CONFIG.TILE + 4,
        y: (supportRow - 1) * CONFIG.TILE + 8,
        width: CONFIG.ENEMY_SIZE,
        height: CONFIG.ENEMY_SIZE,
        kind: kind,
        speed: speed,
        direction: -1,
        baseY: row * CONFIG.TILE + 8,
        phase: Level.enemies.length * 1.7,
        defeated: false
      });
    }
  }
};

Level.enemyHitsSolid = function (enemy, x, y) {
  var left = Math.floor(x / CONFIG.TILE);
  var right = Math.floor((x + enemy.width - 1) / CONFIG.TILE);
  var bottom = Math.floor((y + enemy.height + 1) / CONFIG.TILE);
  return Level.isSolid(left, bottom) || Level.isSolid(right, bottom);
};

Level.enemyOverlaps = function (enemy, x, y) {
  for (var i = 0; i < Level.enemies.length; i++) {
    var other = Level.enemies[i];
    if (other === enemy || other.defeated) { continue; }
    if (x < other.x + other.width && x + enemy.width > other.x &&
        y < other.y + other.height && y + enemy.height > other.y) {
      return true;
    }
  }
  return false;
};

Level.updateEnemies = function (deltaFrames) {
  deltaFrames = deltaFrames === undefined ? 1 : deltaFrames;
  Level.enemyFrame += deltaFrames;
  for (var i = 0; i < Level.enemies.length; i++) {
    var enemy = Level.enemies[i];
    if (enemy.defeated) { continue; }

    if (enemy.kind === "B") {
      enemy.x = enemy.x + enemy.direction * enemy.speed * deltaFrames;
      enemy.y = enemy.baseY + Math.sin((Level.enemyFrame + enemy.phase) / 12) * 18;
      if (enemy.x < 0 || enemy.x + enemy.width > Level.pixelWidth() ||
          Level.isSolid(Math.floor((enemy.x + (enemy.direction > 0 ? enemy.width : 0)) / CONFIG.TILE),
            Math.floor((enemy.y + enemy.height / 2) / CONFIG.TILE))) {
        enemy.direction = enemy.direction * -1;
        enemy.x = enemy.x + enemy.direction * enemy.speed * deltaFrames * 2;
      }
      continue;
    }

    var nextX = enemy.x + enemy.direction * enemy.speed * deltaFrames;
    var hasFloor = Level.enemyHitsSolid(enemy, nextX, enemy.y);
    var ahead = Level.isSolid(Math.floor((nextX + (enemy.direction > 0 ? enemy.width : 0)) / CONFIG.TILE),
      Math.floor((enemy.y + enemy.height / 2) / CONFIG.TILE));
    if (nextX < 0 || nextX + enemy.width > Level.pixelWidth() ||
      !hasFloor || ahead || Level.enemyOverlaps(enemy, nextX, enemy.y)) {
      enemy.direction = enemy.direction * -1;
    } else {
      enemy.x = nextX;
    }
  }
};

Level.hitEnemies = function (x, y, width, height) {
  for (var i = 0; i < Level.enemies.length; i++) {
    var enemy = Level.enemies[i];
    if (enemy.defeated) { continue; }
    if (x < enemy.x + enemy.width && x + width > enemy.x &&
        y < enemy.y + enemy.height && y + height > enemy.y) {
      enemy.defeated = true;
    }
  }
};

// --- STEP 3: find the S and remember where it is ----------------------
Level.findStart = function () {
  for (var row = 0; row < CONFIG.ROWS; row++) {
    for (var col = 0; col < Level.cols; col++) {
      if (Level.charAt(col, row) === "S") {
        Level.startX = col * CONFIG.TILE;
        Level.startY = row * CONFIG.TILE;
        return;
      }
    }
  }
  // no S found anywhere, so just start at the top left
  Level.startX = 0;
  Level.startY = 0;
};

// --- ASKING THE WORLD QUESTIONS ---------------------------------------
// What character is at this grid square?
Level.charAt = function (col, row) {
  if (row < 0 || row >= CONFIG.ROWS) { return "."; }
  if (col < 0 || col >= Level.cols)  { return "."; }
  return Level.grid[row].charAt(col);
};

Level.isSolid  = function (col, row) { return Level.charAt(col, row) === "#"; };
Level.isPlatform = function (col, row) { return Level.charAt(col, row) === "="; };
Level.isSpike  = function (col, row) { return Level.charAt(col, row) === "^"; };
Level.isLadder = function (col, row) { return Level.charAt(col, row) === "L"; };
Level.isEnemyChar = function (kind) { return ["E", "M", "B", "H"].indexOf(kind) >= 0; };
Level.isEnemy  = function (col, row) { return Level.isEnemyChar(Level.charAt(col, row)); };
Level.isCollectibleChar = function (kind) { return ["C", "G", "K"].indexOf(kind) >= 0; };
Level.isWater = function (col, row) { return Level.charAt(col, row) === "W"; };
Level.isFinish = function (col, row) { return Level.charAt(col, row) === "F"; };

// How wide is the whole world, in pixels?
Level.pixelWidth = function () { return Level.cols * CONFIG.TILE; };
