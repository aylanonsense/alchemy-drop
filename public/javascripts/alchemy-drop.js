var AlchemyDrop = (function() {
	function AlchemyDrop() {
		this._board = null;
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
		else if(r < 0.98) {
			return { type: this.BLOCK_TYPES.LEAD };
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

	function AlchemyDropHTMLRenderer() {
		this._parent = null;
	}
	AlchemyDropHTMLRenderer.prototype.renderTo = function(parent) {
		this._parent = parent;
	};
	AlchemyDropHTMLRenderer.prototype.render = function(state) {
		var r, c, div, tileWidth, tileHeight;
		tileWidth = 500 / state.board.length;
		tileHeight = 500 / state.board[0].length;
		this._parent.empty();
		for(c = 0; c < state.board.length; c++) {
			for(r = 0; r < state.board.length; r++) {
				div = $('<div></div>');
				div.css({
					width: tileWidth + 'px',
					height: tileHeight + 'px',
					backgroundColor: 'red',
					position: 'absolute',
					top: (r * tileHeight) + 'px',
					left: (c * tileWidth) + 'px'
				});
				console.log(state.board[c][r]);
				switch(state.board[c][r].type) {
					case 'F': div.css('backgroundColor', 'red'); break;
					case 'W': div.css('backgroundColor', 'blue'); break;
					case 'A': div.css('backgroundColor', 'white'); break;
					case 'E': div.css('backgroundColor', 'brown'); break;
					case 'L': div.css('backgroundColor', 'yellow'); break;
					case 'N': div.css('backgroundColor', 'green'); break;
					case 'M': div.css('backgroundColor', 'purple'); break;
					case 'X': div.css('backgroundColor', 'grey'); break;
					case 'G': div.css('backgroundColor', 'orange'); break;
					case 'P': div.css('backgroundColor', 'black'); break;
					default: div.css('backgroundColor', 'cyan'); break;
				}
				div.appendTo(this._parent);
			}
		}
	};

	function AlchemyDropManager(parent) {
		this._game = new AlchemyDrop();
		this._renderer = new AlchemyDropHTMLRenderer();
		this._game.createBoard(10, 10);
		this._renderer.renderTo(parent);
		this._renderer.render(this._game.getState());
	}

	return AlchemyDropManager;
})();

$(document).ready(function() {
	var alchemyDrop = new AlchemyDrop($("#game"));
});