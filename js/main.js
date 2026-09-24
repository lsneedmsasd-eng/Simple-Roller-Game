/* =====================================================================
   main.js  --  THE STARTING LINE.

   This is the smallest file in the project and it runs last. All it
   does is: set up the screen, load the data files, build the first
   level, and start the loop.

   You will almost never need to change this file.
   ===================================================================== */

Draw.setup();

Level.loadData(function () {
  Game.setMenu("main-menu");
  document.getElementById("start-button").addEventListener("click", Game.startNewGame);
  document.getElementById("settings-button").addEventListener("click", function () {
    Game.setMenu("settings-menu");
  });
  document.getElementById("controls-button").addEventListener("click", function () {
    Game.setMenu("controls-menu");
  });
  var backButtons = document.querySelectorAll(".back-button");
  for (var i = 0; i < backButtons.length; i++) {
    backButtons[i].addEventListener("click", function () { Game.setMenu("main-menu"); });
  }
  document.getElementById("hard-mode").addEventListener("change", function (event) {
    Game.settings.hardMode = event.target.checked;
  });
  Game.loop();
});
