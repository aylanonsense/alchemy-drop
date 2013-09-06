var AlchemyDrop = (function() {
	function AlchemyDrop() {
		this._board = null;
		this._swaps = [];
		this._needsToCheckForCombos = false;
		this._combos = [
			{	name: 'fireball',
				diagram: [	' F ',
							'F F',
							' F ' ] },
			{	name: 'quake',
				diagram: [	'EE EE' ] },
			{	name: 'bolt',
				diagram: [	'L',
							'L',
							'L',
							'L' ] },
			{	name: 'whirlwind',
				diagram: [	'A A',
							'   ',
							'A A' ] },
			{	name: 'sprout',
				diagram: [	'N N',
							' N ',
							' N ' ] },
			{	name: 'rain',
				diagram: [	'W  W',
							' WW ' ] }
		];
		this._parseCombos();
	}
	AlchemyDrop.prototype.TILE_TYPES = {
		FIRE: 'F',
		WATER: 'W',
		AIR: 'A',
		EARTH: 'E',
		LIGHTNING: 'L',
		NATURE: 'N',
		MAGIC: 'M',
		LEAD: 'X',
		GOLD: 'G',
		PHILOSOPHER_STONE: 'P'
	};
	AlchemyDrop.prototype._parseCombos = function() {
		for(var c = 0; c < this._combos.length; c++) {
			this._combos[c].isCombo = this._parseComboDiagram(this._combos[c].diagram);
		}
	};
	AlchemyDrop.prototype._parseComboDiagram = function(diagram) {
		var self = this;
		function is(type, offsetX, offsetY) {
			return function(r, c) {
				if(self._board.length <= c + offsetX) {
					return false;
				}
				if(self._board[0].length <= r + offsetY) {
					return false;
				}
				if(type === ' ') {
					return true;
				}
				return self._board[c + offsetX][r + offsetY].type === type;
			};
		}
		var steps = [];
		for(var r = 0; r < diagram.length; r++) {
			for(var c = 0; c < diagram[r].length; c++) {
				steps.push(is(diagram[r][c], c, r));
			}
		}
		return function(r, c) {
			for(var s = 0; s < steps.length; s++) {
				if(!steps[s](r, c)) {
					return false;
				}
			}
			return true;
		};
	};
	AlchemyDrop.prototype.createBoard = function(columns, rows) {
		this._board = [];
		for(var c = 0; c < columns; c++) {
			this._board[c] = [];
			for(var r = 0; r < rows; r++) {
				this._board[c][r] = this._generateRandomTile();
			}
		}
	};
	AlchemyDrop.prototype._generateRandomTile = function() {
		var r = Math.random();
		if(r < 0.13) {
			return { type: this.TILE_TYPES.FIRE };
		}
		else if(r < 0.26) {
			return { type: this.TILE_TYPES.WATER };
		}
		else if(r < 0.39) {
			return { type: this.TILE_TYPES.AIR };
		}
		else if(r < 0.52) {
			return { type: this.TILE_TYPES.EARTH };
		}
		else if(r < 0.65) {
			return { type: this.TILE_TYPES.LIGHTNING };
		}
		else if(r < 0.78) {
			return { type: this.TILE_TYPES.NATURE };
		}
		else if(r < 0.91) {
			return { type: this.TILE_TYPES.MAGIC };
		}
		else if(r < 0.96) {
			return { type: this.TILE_TYPES.LEAD };
		}
		else if(r < 0.98) {
			return { type: this.TILE_TYPES.GOLD };
		}
		else {
			return { type: this.TILE_TYPES.PHILOSOPHER_STONE };
		}
	};
	AlchemyDrop.prototype.getState = function() {
		return {
			board: this._board
		};
	};
	AlchemyDrop.prototype._validateSwap = function(swap) {
		var t, tile;
		var swapIsTrivial = ((swap.xMove === 0 && swap.yMove === 0) || swap.tiles.length === 0);
		var isMovingTilesOffBoard = false;
		var illegalTilesBeingSwapped = [];

		for(t = 0; t < swap.tiles.length; t++) {
			//FROM TILES
			//the move is illegal if it moves tiles off the board
			if(swap.tiles[t].col < 0 || swap.tiles[t].col > this._board.length || swap.tiles[t].row < 0 || swap.tiles[t].row > this._board[0].length) {
				isMovingTilesOffBoard = true;
			}
			else {
				//the move is illegal if it contains lead or gold
				tile = this._board[swap.tiles[t].col][swap.tiles[t].row];
				if(tile.type === this.TILE_TYPES.LEAD || tile.type === this.TILE_TYPES.GOLD) {
					illegalTilesBeingSwapped.push({ tile: tile, row: swap.tiles[t].row, col: swap.tiles[t].col });
				}
			}
			//TODO the move is illegal if any tiles are non-adjacent

			//TO TILES
			//the move is illegal if it moves tiles off the board
			if(swap.tiles[t].col + swap.xMove < 0 || swap.tiles[t].col + swap.xMove > this._board.length || swap.tiles[t].row + swap.yMove < 0 || swap.tiles[t].row + swap.yMove > this._board[0].length) {
				isMovingTilesOffBoard = true;
			}
			else {
				//the move is illegal if it contains lead or gold
				tile = this._board[swap.tiles[t].col + swap.xMove][swap.tiles[t].row + swap.yMove];
				if(tile.type === this.TILE_TYPES.LEAD || tile.type === this.TILE_TYPES.GOLD) {
					illegalTilesBeingSwapped.push({ tile: tile, row: swap.tiles[t].row + swap.yMove, col: swap.tiles[t].col + swap.xMove });
				}
			}
		}

		return {
			isValid: !swapIsTrivial && !isMovingTilesOffBoard && illegalTilesBeingSwapped.length === 0,
			swapIsTrivial: swapIsTrivial,
			isMovingTilesOffBoard: isMovingTilesOffBoard,
			illegalTilesBeingSwapped: illegalTilesBeingSwapped
		};
	};
	AlchemyDrop.prototype._swap = function(swap) {
		//if the move is illegal, return the validation object
		var validation = this._validateSwap(swap);
		if(!validation.isValid) {
			return { action: 'swap-prohibited', reason: validation };
		}

		//swap the tiles
		for(t = 0; t < swap.tiles.length; t++) {
			tile = this._board[swap.tiles[t].col][swap.tiles[t].row];
			this._board[swap.tiles[t].col][swap.tiles[t].row] = this._board[swap.tiles[t].col + swap.xMove][swap.tiles[t].row + swap.yMove];
			this._board[swap.tiles[t].col + swap.xMove][swap.tiles[t].row + swap.yMove] = tile;
		}

		//the game will need to check for combos next
		this._needsToCheckForCombos = true;

		//return swap action
		return {
			action: 'swap',
			tiles: swap.tiles,
			xMove: swap.xMove,
			yMove: swap.yMove
		};
	};
	AlchemyDrop.prototype._checkForCombos = function() {
		var combos = [];
		for(var i = 0; i< this._combos.length; i++) {
			for(var c = 0; c < this._board.length; c++) {
				for(var r = 0; r < this._board[0].length; r++) {
					if(this._combos[i].isCombo(r, c)) {
						combos.push({
							name: this._combos[i].name,
							row: r,
							col: c
						});
					}
				}
			}
		}
		return {
			combos: combos
		};
	};
	AlchemyDrop.prototype.next = function() {
		if(this._needsToCheckForCombos) {
			var comboObj = this._checkForCombos();
			if(comboObj.combos.length > 0) {
				return comboObj;
			}
			else {
				this._needsToCheckForCombos = false;
			}
		}
		if(this._swaps.length > 0) {
			return this._swap(this._swaps.splice(0, 1)[0]);
		}
		return { action: 'yield' };
	};
	AlchemyDrop.prototype.queueSwap = function(tiles, xMove, yMove) {
		this._swaps.push({
			tiles: tiles,
			xMove: xMove,
			yMove: yMove
		});
	};

	function AlchemyDropHTMLRenderer() {
		this._parent = null;
	}
	AlchemyDropHTMLRenderer.prototype.renderTo = function(parent) {
		this._parent = parent;
	};
	AlchemyDropHTMLRenderer.prototype.render = function(state) {
		var r, c, div, tileWidth, tileHeight;
		tileWidth = 50;
		tileHeight = 50;
		this._parent.empty();
		for(c = 0; c < state.board.length; c++) {
			for(r = 0; r < state.board.length; r++) {
				div = $('<div></div>');
				div.css({
					width: tileWidth + 'px',
					height: tileHeight + 'px',
					position: 'absolute',
					top: (r * tileHeight) + 'px',
					left: (c * tileWidth) + 'px'
				});
				div.css('backgroundImage', 'url("./image/tiles.png")');
				switch(state.board[c][r].type) {
					case 'F':div.css('backgroundPosition', '-0px -0px'); break;
					case 'W': div.css('backgroundPosition', '-50px -0px'); break;
					case 'A': div.css('backgroundPosition', '-0px -100px'); break;
					case 'E': div.css('backgroundPosition', '-0px -50px'); break;
					case 'L': div.css('backgroundPosition', '-100px -50px'); break;
					case 'N': div.css('backgroundPosition', '-100px -0px'); break;
					case 'M': div.css('backgroundPosition', '-50px -50px'); break;
					case 'X': div.css('backgroundPosition', '-50px -100px'); break;
					case 'G': div.css('backgroundPosition', '-100px -100px'); break;
					case 'P': div.css('backgroundPosition', '-0px -150px'); break;
					default: div.css('backgroundPosition', '-50px -150px'); break;
				}
				div.appendTo(this._parent);
			}
		}
	};

	function AlchemyDropCanvasRenderer(game) {
		this._game = game;
		this._parent = null;
		this._canvas = null;
		this._sprites = {};
		this._rawImages = {};
		this._selectedTiles = [];
	}
	AlchemyDropCanvasRenderer.prototype.loadResources = function(callback) {
		var self = this;
		var imagesToLoad = [
			{ name: 'tiles', src: './image/tiles.png' }
		];
		var numImagesLoaded = 0;
		imagesToLoad.forEach(function(img) {
			var image = new Image();
			image.onload = function() {
				self._rawImages[img.name] = image;
				numImagesLoaded++;
				if(numImagesLoaded === imagesToLoad.length) {
					self._createSpriteSheets();
					callback();
				}
			};
			image.src = img.src;
		});
	};
	AlchemyDropCanvasRenderer.prototype._createSpriteSheets = function() {
		this._sprites.tiles = new SpriteSheet(this._rawImages.tiles, 4, 3);
	};
	AlchemyDropCanvasRenderer.prototype.renderTo = function(parent) {
		this._parent = parent;
		this._canvas = $('<canvas width="500px" height="500px"></canvas>').appendTo(this._parent);
		this._ctx = this._canvas[0].getContext('2d');
		this._addEventListeners();
	};
	AlchemyDropCanvasRenderer.prototype._addEventListeners = function() {
		var self = this;
		this._canvas.on('mousedown', function(evt) {
			var startingPos = { x: evt.offsetX, y: evt.offsetY };
			self._selectTileAt(startingPos.x, startingPos.y);
			function onMove(evt) {
				var currPos = { x : evt.offsetX, y: evt.offsetY };
				self._selectTileAt(currPos.x, currPos.y);
			}
			function onUp(evt) {
				var endingPos = { x: evt.offsetX, y: evt.offsetY };
				self._selectTileAt(endingPos.x, endingPos.y);
				self._canvas.off('mousemove', onMove);
				self._canvas.off('mouseup', onUp);
			}
			self._canvas.on('mousemove', onMove);
			self._canvas.on('mouseup', onUp);
		});
	};
	AlchemyDropCanvasRenderer.prototype._selectTileAt = function(x, y) {
		var row = Math.floor(y / 50);
		var col = Math.floor(x / 50);
		for(var t = 0; t < this._selectedTiles.length; t++) {
			if(this._selectedTiles.row === row && this._selectedTiles.col === col) {
				return;
			}
		}
		this._selectedTiles.push({
			row: row,
			col: col
		});
	};
	AlchemyDropCanvasRenderer.prototype.render = function() {
		var r, c, tileWidth = 50, tileHeight = 50;
		var state = this._game.getState();

		//clear the canvas
		this._ctx.fillStyle = '#000';
		this._ctx.fillRect(0, 0, 500, 500);

		for(c = 0; c < state.board.length; c++) {
			for(r = 0; r < state.board.length; r++) {
				var frame;
				switch(state.board[c][r].type) {
					case 'F': frame = 0; break;
					case 'W': frame = 1; break;
					case 'A': frame = 6; break;
					case 'E': frame = 3; break;
					case 'L': frame = 5; break;
					case 'N': frame = 2; break;
					case 'M': frame = 4; break;
					case 'X': frame = 7; break;
					case 'G': frame = 8; break;
					case 'P': frame = 9; break;
					default: frame = 10; break;
				}
				if(this._sprites.tiles) {
					this._sprites.tiles.drawFrame(this._ctx, frame, c * 50, r * 50);
				}
				for(var t = 0; t < this._selectedTiles.length; t++) {
					if(this._selectedTiles[t].row === r && this._selectedTiles[t].col === c) {
						this._ctx.fillStyle = '#f00';
						this._ctx.fillRect(10 + 50 * c, 10 + 50 * r, 30, 30);
					}
				}
			}
		}
	};

	function SpriteSheet(img, rows, cols) {
		this._img = img;
		this._frames = [];
		var frameWidth = this._img.width / cols;
		var frameHeight = this._img.height / rows;
		for(var r = 0; r < rows; r++) {
			for(var c = 0; c < cols; c++) {
				this._frames.push({
					x: c * frameWidth,
					y: r * frameHeight,
					width: frameWidth,
					height: frameHeight
				});
			}
		}
	}
	SpriteSheet.prototype.drawFrame = function(ctx, frameNum, x, y) {
		var frame = this._frames[frameNum];
		ctx.drawImage(this._img, frame.x, frame.y, frame.width, frame.height, x, y, frame.width, frame.height);
	};

	function AlchemyDropManager(parent) {
		var self = this;
		this._game = new AlchemyDrop();
		this._renderer = new AlchemyDropCanvasRenderer(this._game);
		this._game.createBoard(4, 4);
		this._renderer.loadResources(function() {
			self._renderer.render();
		});
		this._renderer.renderTo(parent);
	}
	AlchemyDropManager.prototype.swap = function(tiles, xMove, yMove) {
		this._game.queueSwap(tiles, xMove, yMove);
		while(this._game.next().action !== 'yield') {}
		this._renderer.render();
	};

	return AlchemyDropManager;
})();

$(document).ready(function() {
	var alchemyDrop = new AlchemyDrop($("#game"));
	setInterval(function() {
		alchemyDrop.swap([{
			row: Math.floor(4 * Math.random()),
			col: Math.floor(3 * Math.random())
		}], 1, 0);
	}, 100);
});