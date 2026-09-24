const assert = require('assert');
const fs = require('fs');
const path = require('path');

const pieces = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/pieces.json')));
const levels = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/levels.json'))).levels;

for (const level of levels) {
  for (let index = 0; index < level.pieces.length - 1; index += 1) {
    const left = pieces[level.pieces[index]];
    const right = pieces[level.pieces[index + 1]];
    const hasGroundTransition = left[7].split('').some((tile, column) =>
      tile !== '#' && right[7][column] !== '#');
    assert.ok(hasGroundTransition, `${level.name} is blocked between ${level.pieces[index]} and ${level.pieces[index + 1]}`);
  }
}

console.log('level boundary test passed');