(function(){
	/*
	Features:
		Draws a grid for the board
		Click to place a stone
		Next stone color alternates each turn
		Shadows are drawn under each stone to indicate the attack/link radius

	TODO:
		General
			Look at latest version of Raphael, my version is OLD!
			Use a package manager for Raphael and other dependencies
			Organize SVG elements into svg groups
			Manually control SVG instead of using Raphael?
		Game Logic
			track placed stones
			freedoms
			attacks
			groups / linking
		Additional Graphics
			show ghost stone. stone disapears in case of collision.
			show different shade of ghost stone in case of collision while button is held down.
			board background
			mark or visually indicate attacked stones
			use a different shadow affect to show linked stone groups
			create other board graphics as an alternative to full grid:
				dots on grid intersections
				dots for "major" intersections
		Display Game stats in additional controls

	Notes:

		Raphael has a built in bounding box (element.getBbox() ), but it is based on x, y, height, and width.
		I need top, bottom, left, and right for intersection testing, so it isn't ideal.  Have to do extra computations.

	*/

	var ATTACK_RADIUS = 50;

	Raphael.fn.stone = function (x, y, r, hue) {
		hue = hue || 0;
		var createdSet = this.set(
			// Colored Stone. bright spot near the bottom, dark around the edges.
			this.ellipse(x, y, r, r).attr({fill: "r(.5,.9)hsb(" + hue + ", 1, .75)-hsb(" + hue + ", .5, .25)", stroke: "none"}),
			// Inner greyscale shine effect.  Bright spot near the top.
			this.ellipse(x, y, r - r / 5, r - r / 20).attr({stroke: "none", fill: "r(.5,.1)#ccc-#ccc", opacity: 0})
		);
		createdSet.x = x;
		createdSet.y = y;
		createdSet.r = r;
		//createdSet.hue = hue;

		return createdSet;
	};

	Raphael.fn.stoneShadow = function (x, y, hue) {
		hue = hue || 0;
		var createdSet = this.set(
			// Visualization of attack radius.
			this.ellipse(x, y, ATTACK_RADIUS, ATTACK_RADIUS)
				.attr({	stroke: "hsb(" + hue + ", 1, .75)",
						fill: "r(.5,.5)hsb(" + hue + ", .8, .75)-hsb(" + hue + ", .7, .75)",
						opacity: 0}),
			// Hack: a set with just one item will not be removed, so adding a zero size ellipse.
			// TODO: try not using a set at all.
			this.ellipse(x, y, 0, 0)
		);
		createdSet.x = x;
		createdSet.y = y;

		return createdSet;
	};

	var stones = [];
	var shadows = [];

	window.onload = function () {
		var cellSize = ATTACK_RADIUS;
		var halfCellSize = cellSize / 2;
		var STONE_RADIUS = cellSize * 0.45;
		var numCells = 13;

		var boardWidth = cellSize * numCells, boardHeight = cellSize * numCells;
		var R = Raphael("holder", boardWidth, boardHeight);

		//alert("a");
		// Size the graphic playing area
		var holder = document.getElementById("holder");
		holder.style.height = boardHeight+"px";
		holder.style.width = boardWidth+"px";

		//alert("b");
		// For traditional board grid

		var gridTop = halfCellSize;
		var gridBottom = boardHeight - halfCellSize;
		var gridLeft = halfCellSize;
		var gridRight = boardWidth - halfCellSize;

		/*
		var = x, y;
		// Make a grid of stones.
		for(x = cellSize; x < boardWidth; x += cellSize){
			for(y = cellSize; y < boardHeight; y += cellSize){
				R.stone(x, y, radius, Math.random());
			}
		}
		*/

		var drawGrid = function()
		{
			var x, y;
			for(x = gridLeft; x <= gridRight; x += cellSize){
				R.path("M"+x+" "+gridTop+"L"+x+" "+gridBottom).attr({stroke: "#eee"});
			}

			for(y = gridTop; y <= gridBottom; y += cellSize){
				R.path("M"+gridLeft+" "+y+"L"+gridRight+" "+y).attr({stroke: "#eee"});
			}
		}

		drawGrid();

		//alert("3");

		var turn = 0;

		holder.onclick = function(mouseEvent){
			// in Chrome, correct mouse event co-ordinates can be found in:
			//	offsetX
			//	layerX
			// note, offestX and offsetY also worked in IE.

			x = mouseEvent.offsetX;
			y = mouseEvent.offsetY;

			var redHue = 1.0;
			var blueHue = 0.6;
			var greenHue = 0.3;
			var purpleHue = 0.75;
			var orangeHue = 0.1;
			var yellowHue = 0.2;

			var hue;

			if(turn % 2 == 0) hue = blueHue;
			else hue = redHue;

			if(gridLeft < x && x < gridRight && gridTop < y && y < gridBottom)
			{
				var newShadow =
					R.stoneShadow(x, y, hue);

				var newStone =
					R.stone(x, y, STONE_RADIUS, hue);

				var collide = false;
				var stoneIndex = 0;

				while(stoneIndex < stones.length){
					if(circlesIntersect(newStone, stones[stoneIndex]))
					{
						collide = true;
						break;
					}
					++stoneIndex;
				}

				if(collide){
					alert("Collide with stone "+stoneIndex);
					newShadow.remove();
					newStone.remove();
				} else {
					//alert("No collision 1");
					shadows[shadows.length] = newShadow;
					stones[stones.length] = newStone;
					//alert("x: "+newStone.getBBox().x);
					++turn;
				}
			}
		};
	};

	// Check if two circles OF THE SAME RADIUS
	// intersect.  Optimized with a cheap check
	// first before doing an exact check.
	var circlesIntersect = function(stone1, stone2)
	{
		try{

			var intersects = false;

			// Assuming same size stones.
			var sideLength = stone1.r * 2;

			// Do a cheap bounding box intersection check.
			if(cheapCirclesMayIntersect(stone1, stone2))
			{
				// Only do a more expensive check if the circles intersect when the bounding boxes intersect.
				intersects = exactCirclesIntersect(stone1, stone2);
			}
			return intersects;
		}catch(e){
			alert(e.toString());
		}
	}

	var cheapCirclesMayIntersect = function(circle1, circle2)
	{
		try{
			//alert("cheapCirclesMayIntersect");
			diameter1 = circle1.r * 2;
			diameter2 = circle2.r + 2;

			//top1 <= bottom2
			var b1 = circle1.y <= circle2.y + diameter2;
			//bottom1 >= top2
			var b2 = circle1.y + diameter1 >= circle2.y;
			//left1 <= right2
			var b3 = circle1.x <= circle2.x + diameter2;
			//right1 >= left2
			var b4 = circle1.x + diameter1 >= circle2.x;

			return b1 && b2 && b3 && b4;

		} catch(e) {
			alert(e.toString());
		}
	};

	var exactCirclesIntersect = function(circle1, circle2)
	{
		try{
			var dist = Math.sqrt((circle2.x - circle1.x)*(circle2.x - circle1.x) + (circle2.y - circle1.y)*(circle2.y - circle1.y));
			return (dist <= circle1.r + circle2.r);
		} catch(e) {
			alert(e.toString());
		}
	}
})();
