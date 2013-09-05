var AlchemyDrop = (function() {
	function AlchemyDrop() {
		this._board = null;
		this._swaps = [];
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
	AlchemyDrop.prototype._handleSwap = function(swap) {
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
		return {
			action: 'swap',
			tiles: swap.tiles,
			xMove: swap.xMove,
			yMove: swap.yMove
		};
	};
	AlchemyDrop.prototype.next = function() {
		if(this._swaps.length > 0) {
			var t, tile;
			var swap = this._swaps[0];
			this._swaps.splice(0, 1);
			return this._handleSwap(swap);
		}
		return { action: 'yield' };
	};
	AlchemyDrop.prototype.swap = function(tiles, xMove, yMove) {
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

	function AlchemyDropManager(parent) {
		this._game = new AlchemyDrop();
		this._renderer = new AlchemyDropHTMLRenderer();
		this._game.createBoard(4, 4);
		this._renderer.renderTo(parent);
		this._renderer.render(this._game.getState());
	}
	AlchemyDropManager.prototype.swap = function(tiles, xMove, yMove) {
		this._game.swap(tiles, xMove, yMove);
		this._game.next();
		this._renderer.render(this._game.getState());
	};

	return AlchemyDropManager;
})();

$(document).ready(function() {
	var alchemyDrop = new AlchemyDrop($("#game"));
	setInterval(function() {
		alchemyDrop.swap([{
			row: Math.floor(1 + 2 * Math.random()),
			col: Math.floor(1 + 2 * Math.random())
		}], Math.floor(3 * Math.random() -1 ), Math.floor(3 * Math.random() -1 ));
	}, 1000);
});