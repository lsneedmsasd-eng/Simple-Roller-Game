# ROLLER - the base game

A circle with an off-center dot rolls through a black and white world.
It can move, jump, land on platforms, and die on spikes. It wins by
touching the flag. Collect coins, gems, and keys along the way.

That is the whole game. Everything else is yours to add.

## How to play it

Push your changes, then open your GitHub Pages link.
Press `Ctrl + Shift + R` to hard refresh, or you will see the old version.

- LEFT / RIGHT arrow - roll
- SHIFT - dash
- SPACE or UP arrow - jump
- UP/W and DOWN/S - climb ladders
- X/J - melee attack
- Water drains oxygen; leave it before the oxygen bar empties.
- Every fifth completed level opens a shop. Press 1, 2, or 3 to buy an upgrade, then ENTER to continue.
- R - restart the level

Enemies have different movement patterns: walkers patrol platforms, runners move faster, brutes are larger, and bats fly. Press X or J to defeat them at close range.

## Where everything lives

| If you want to change... | Open this file |
|---|---|
| how high it jumps, how fast it moves, how heavy gravity feels | `js/config.js` |
| which keys do what | `js/input.js` |
| the shape of the levels | `data/levels.json` |
| the level pieces themselves | `data/pieces.json` |
| how the world is built out of pieces | `js/level.js` |
| whether something counts as a hit | `js/collide.js` |
| how the player moves, jumps, and dies | `js/player.js` |
| how anything LOOKS | `js/draw.js` |
| the rules, the win and lose conditions, the loop | `js/game.js` |
| the page around the game | `index.html` and `style.css` |

## How levels work

A level is a list of piece names, in order, left to right.
Open `data/levels.json` and you will see something like this:

    "pieces": ["start", "flat", "gap", "flat", "spikes", "finish"]

Every one of those names is a little picture in `data/pieces.json`.
Each picture is 8 columns wide and 10 rows tall:

    "gap": [
      "........",
      "........",
      "........",
      "........",
      "........",
      "........",
      "........",
      "........",
      "###..###",
      "###..###"
    ]

- `.` is empty air
- `#` is a solid block
- `^` is a spike
- `W` is water
- `=` is a one-way platform. Jump up through it, or press DOWN while standing on it to drop through.
- `S` is where the player starts
- `F` is the finish
- Some generated levels place the finish high up, so use a ladder to reach it.
- `C` is a coin, `G` is a gem, and `K` is a key. Collected items are shown in the counter at the top of the game.
- Terrain pieces include rolling hills, marshes, bridges, vertical climbs, caves, and crystal rooms.

To make a new level: change the list of names.
To make a new piece: copy one, rename it, redraw the picture, then use
that name in a level.

## Things to know before you change anything

- The player is a **box** for collisions and a **circle** for drawing.
  That is on purpose. Boxes are easier to check and nobody can tell.
- Every file is loaded in order at the bottom of `index.html`.
  If you add a new file, add it to that list too.
- The level data is loaded with `fetch()`, which only works over http.
  Use your GitHub Pages link. Opening `index.html` straight off your
  hard drive will not load the levels.
