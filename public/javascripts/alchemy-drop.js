var AlchemyDrop = (function() {
	function AlchemyDrop() {
		this._board = null;
		this._swaps = [];
	}
	AlchemyDrop.prototype.BLOCK_TYPES = {
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
			return { type: this.BLOCK_TYPES.FIRE };
		}
		else if(r < 0.26) {
			return { type: this.BLOCK_TYPES.WATER };
		}
		else if(r < 0.39) {
			return { type: this.BLOCK_TYPES.AIR };
		}
		else if(r < 0.52) {
			return { type: this.BLOCK_TYPES.EARTH };
		}
		else if(r < 0.65) {
			return { type: this.BLOCK_TYPES.LIGHTNING };
		}
		else if(r < 0.78) {
			return { type: this.BLOCK_TYPES.NATURE };
		}
		else if(r < 0.91) {
			return { type: this.BLOCK_TYPES.MAGIC };
		}
		else if(r < 0.96) {
			return { type: this.BLOCK_TYPES.LEAD };
		}
		else if(r < 0.98) {
			return { type: this.BLOCK_TYPES.GOLD };
		}
		else {
			return { type: this.BLOCK_TYPES.PHILOSOPHER_STONE };
		}
	};
	AlchemyDrop.prototype.getState = function() {
		return {
			board: this._board
		};
	};
	AlchemyDrop.prototype.next = function() {
		var swap, t, tile;
		if(this._swaps.length > 0) {
			swap = this._swaps[0];
			this._swaps.splice(0, 1); //remove the first
			for(t = 0; t < swap.tiles.length; t++) {
				tile = this._board[swap.tiles[t].col][swap.tiles[t].row];
				this._board[swap.tiles[t].col][swap.tiles[t].row] = this._board[swap.tiles[t].col + swap.xMove][swap.tiles[t].row + swap.yMove];
				this._board[swap.tiles[t].col + swap.xMove][swap.tiles[t].row + swap.yMove] = tile;
			}
		}
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