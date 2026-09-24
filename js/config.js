/* =====================================================================
   config.js  --  ALL THE NUMBERS.

   This is the first file to open if you want to change how the game
   FEELS. Every number here is safe to change. Change one at a time and
   play the game after each change.
   ===================================================================== */

var CONFIG = {

  // --- the world grid -------------------------------------------------
  TILE: 40,           // how many pixels wide and tall one grid square is
  ROWS: 10,           // how many rows tall every level piece is
  PIECE_COLS: 8,      // how many columns wide every level piece is

  // --- the screen -----------------------------------------------------
  CANVAS_W: 1000,
  CANVAS_H: 560,

  // --- how the player moves -------------------------------------------
  MOVE_SPEED: 4,      // pixels per frame left and right
  DASH_SPEED: 12,     // a burst of speed when the player dashes
  DASH_DURATION: 6,   // how many frames the burst lasts
  CLIMB_SPEED: 4,     // pixels per frame on a ladder
  ATTACK_COOLDOWN: 18,
  ATTACK_DURATION: 8,
  ATTACK_RANGE: 44,
  ENEMY_SIZE: 32,
  COLLECTIBLE_SIZE: 22,
  MAX_OXYGEN: 600,
  OXYGEN_DRAIN: 1,
  OXYGEN_RECOVERY: 3,
  WATER_GRAVITY: 0.35,
  JUMP_POWER: 15,     // how hard the jump pushes UP. bigger = higher
  GRAVITY: 0.8,       // how hard the world pulls DOWN. bigger = heavier
  MAX_FALL: 16,       // fastest the player is allowed to fall
  DASH_COOLDOWN: 18,  // frames before a new dash can start

  // --- the player's size ----------------------------------------------
  PLAYER_SIZE: 32,    // the player collides as a 32x32 box
  PLAYER_RADIUS: 16,  // ...but is DRAWN as a circle this big

  // --- drawing --------------------------------------------------------
  LINE_WIDTH: 3,      // thickness of every black outline
  DOT_DISTANCE: 0.55, // how far the off-center dot sits from the middle
                      // 0 = dead center, 1 = right on the edge

  // --- rules ----------------------------------------------------------
  START_LEVEL: 0      // which level in data/levels.json to load first
};

