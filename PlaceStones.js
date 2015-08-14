(function(){
	/*
	Features:
		Draws a grid for the board
		Click to place a stone
		Next stone color alternates each turn
		Shadows are drawn under each stone to indicate the attack/link radius

	TODO:
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

	var attackRadius = 50;

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
			this.ellipse(x, y, attackRadius, attackRadius)
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
		var cellSize = attackRadius;
		var halfCellSize = cellSize / 2;
		var stoneRadius = cellSize * 0.45;
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
					R.stone(x, y, stoneRadius, hue);

				var collide = false;
				var stoneIndex = 0;

				while(stoneIndex < stones.length){
					if(stonesIntersect(newStone, stones[stoneIndex]))
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

	var stonesIntersect = function(stone1, stone2)
	{
		try{
			//alert("stonesIntersect" +
			//	"\nstone1.x: " + stone1.x +
			//	"\nstone1.y: " + stone1.y +
			//	"\nstone1.r: " + stone1.r +
			//	"\nstone2.x: " + stone2.x +
			//	"\nstone2.y: " + stone2.y +
			//	"\nstone2.r: " + stone2.r);

			var intersects = false;

			// Assuming same size stones.
			var sideLength = stone1.r * 2;

			// Do a cheap bounding box intersection check.
			var bSquaresIntersect = squaresIntersect(stone1.x, stone1.y, sideLength, stone2.x, stone2.y, sideLength);
			if(bSquaresIntersect)
			{
				//alert("stonesIntersect 2");
				// Only do a more expensive check if the circles intersect when the bounding boxes intersect.
				intersects = circlesIntersect(stone1.x, stone1.y, stone1.r, stone2.x, stone2.y, stone2.r);
			}
			return intersects;
		}catch(e){
			alert(e.toString());
		}
	}

	var squaresIntersect = function(x1, y1, side1, x2, y2, side2)
	{
		try{
			//alert("squaresIntersect");

			//top1 <= bottom2
			var b1 = y1 <= y2 + side2;
			//bottom1 >= top2
			var b2 = y1 + side1 >= y2;
			//left1 <= right2
			var b3 = x1 <= x2 + side2;
			//right1 >= left2
			var b4 = x1 + side1 >= x2;

			return b1 && b2 && b3 && b4;

		} catch(e) {
			alert(e.toString());
		}
	};

	var circlesIntersect = function(x1, y1, r1, x2, y2, r2)
	{
		try{
			var dist = Math.sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1));
			return (dist <= r1 + r2);
		} catch(e) {
			alert(e.toString());
		}
	}
})();
