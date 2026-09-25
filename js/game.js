/* =====================================================================
   game.js  --  THE RULES AND THE LOOP.

   The game is always in exactly ONE mode: "playing", "dead", or "won".
   Which mode it is in decides what happens each frame.

   The loop runs about 60 times a second, forever. Every time it runs it
   does the same two things: UPDATE (change the numbers) and DRAW (show
   the numbers).
   ===================================================================== */

var Game = {
  mode: "menu",      // "menu", "playing", "dead", "won", or "shop"
  levelNumber: 0,
  completedLevels: 0,
  coins: 0,
  settings: { hardMode: false },
  lastTime: 0
};

Game.setMenu = function (section) {
  var menu = document.getElementById("menu-screen");
  var sections = ["main-menu", "settings-menu", "controls-menu"];
  for (var i = 0; i < sections.length; i++) {
    document.getElementById(sections[i]).hidden = sections[i] !== section;
  }
  menu.hidden = false;
  Game.mode = "menu";
};

Game.hideMenu = function () {
  document.getElementById("menu-screen").hidden = true;
};

Game.startNewGame = function () {
  Game.completedLevels = 0;
  Game.coins = 0;
  Player.speedBonus = 0;
  Player.jumpBonus = 0;
  Player.maxOxygen = CONFIG.MAX_OXYGEN;
  Game.startLevel(CONFIG.START_LEVEL);
};

Game.startLevel = function (levelNumber) {
  Game.levelNumber = levelNumber;
  Level.build(levelNumber);
  Player.reset();
  Game.mode = "playing";
  Game.hideMenu();
  Game.showMessage("");
};

Game.startRandomLevel = function () {
  Game.startLevel(Level.generateRandom());
};

Game.openShop = function () {
  Game.mode = "shop";
  Game.showMessage("Shop: press 1 for air, 2 for speed, 3 for jump. Press ENTER when done.");
};

Game.buyShopItem = function (choice) {
  var costs = [3, 5, 5];
  if (choice < 1 || choice > 3 || Game.coins < costs[choice - 1]) { return false; }
  Game.coins -= costs[choice - 1];
  if (choice === 1) { Player.maxOxygen += 240; }
  if (choice === 2) { Player.speedBonus += 0.5; }
  if (choice === 3) { Player.jumpBonus += 1; }
  Game.showMessage("Upgrade purchased. Choose another or press ENTER.");
  return true;
};

Game.leaveShop = function () {
  Game.startRandomLevel();
};

Game.showMessage = function (text) {
  document.getElementById("message").textContent = text;
};

// --- ONE FRAME --------------------------------------------------------
Game.update = function () {

  // R always restarts, no matter what mode we are in.
  if (Input.restart) {
    Game.startLevel(Game.levelNumber);
    return;
  }

  if (Game.mode === "menu") { return; }

  if (Game.mode === "shop") {
    if (Input.shopChoice) {
      Game.buyShopItem(Input.shopChoice);
      Input.shopChoice = 0;
    }
    if (Input.shopContinue) { Game.leaveShop(); }
    return;
  }

  // If we are not playing, nothing moves. We just wait for R.
  if (Game.mode !== "playing") { return; }

  var deltaFrames = arguments.length > 0 ? arguments[0] : 1;
  Level.updateEnemies(deltaFrames);
  Player.update(deltaFrames);

  if (Player.isDead()) {
    Game.mode = "dead";
    var reason = Player.deathReason === "oxygen" ? "You ran out of oxygen." : "You hit something.";
    Game.showMessage(reason + " Press R to try again.");
    return;
  }

  if (Player.hasWon()) {
    Game.completedLevels++;
    Game.coins += Level.collected;
    if (Game.completedLevels % 5 === 0) {
      Game.openShop();
    } else {
      Game.startRandomLevel();
    }
    return;
  }
};

// --- THE LOOP ITSELF --------------------------------------------------
Game.loop = function (time) {
  if (!Game.lastTime) { Game.lastTime = time; }
  var deltaFrames = Math.min(3, Math.max(0, (time - Game.lastTime) / (1000 / 60)));
  Game.lastTime = time;
  Game.update(deltaFrames);
  Draw.updateCamera();
  Draw.everything();
  window.requestAnimationFrame(Game.loop);
};
