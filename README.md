# Web Go Board

An HTML5 based implementation of the game Go (also called igo, weiqi or wéiqí), using SVG and the Raphael library.  This is currently not a functional game, no game logic is implemented yet.  In the future I plan on supporting a traditional game format where stones are played on the intersection of board lines, and an `analog` version where stones can be played anywhere on the board.  Currently only the analog version is in place, I will support the traditional style with a mode that forces stones to snap to the grid.

Currently works in Chrome, not in Firefox.  Don't know about IE.

## Features

* Draws a grid for the board.
* Click to place a stone.
* Next stone color alternates each turn.
* Shadows are drawn under each stone to indicate the attack/link radius.

## Roadmap

### General

* Use a package manager for Raphael and other dependencies
* Organize SVG elements into svg groups
* Manually control SVG instead of using Raphael?
* Display Game stats in additional controls

### Game Logic

* Track coordinates of placed stones.
* Count _freedoms_ for each stone.  In standard Go, each stone has 4 freedoms.
* Implement attacks, which decrement freedoms.
* Implement capturing stones when they have zero freedoms.
* Implement stone groups, with combined freedom and attack counts.

### Additional Graphics

* Show ghost stone before a stone is placed. The ghost stone will disappear in case of collision.
* Show different shade of ghost stone in case of collision while button is held down.
* Board background.
* Mark or visually indicate attacked stones.
* Use a different shadow affect to show linked stone groups.
* Create other board graphics as an alternative to full grid:
  * Dots on grid intersections.
  * Dots for "major" intersections.
