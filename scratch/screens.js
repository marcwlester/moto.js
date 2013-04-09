var Screen = Class.extend({
	elementId: null,
	element: null,
	app: null,
	onRender: null,
	renderCalls: 0,

	init: function(id, renderCallback) {
		console.log(id);
		this.elementId = id;
		this.element = document.getElementById(id);
		this.element.style.display = 'none';
		this.onRender = renderCallback || function(dt) {};
	},

	render: function(dt) {
		jQuery(this.element).html('hello ' + this.renderCalls);
		this.renderCalls++;
		if (this.app.input.pressed('g')) {
			this.onRender(dt);
		}
		//this.onRender.apply(this, [dt]);
	},

	show: function() {
		this.element.style.display = 'block';
	},
	hide: function() {
		this.element.style.display = 'none';
	},

	setApp: function(app) {
		this.app = app;
	}
});

var Application = Class.extend({
	_screen: null,
	//_app: null,
	//_window: window,

	setScreen: function(scr) {
		if (this._screen != null) this._screen.hide();
		this._screen = scr;
		this._screen.setApp(this);
		if (this._screen != null) {
			this._screen.show();
		} 
	},

	render: function() {
		
		if (this._screen != null) {
			//console.log(this._screen);
			this._screen.render(1/60);
		}
		window.requestAnimationFrame(this.render.bind(this));
		//var self = this;
		//window.setTimeout( this._app.render, 1000 / 60 );
		//console.log(self);
	},

	run: function() {
		this.render();
	}
});


var IntroScreen = new Screen('intro-screen', function(dt) {
	jQuery(this.element).html('hello');
	//console.log(this.app);
	console.log(this.app.input.pressed('g'));
	if (this.app.input.pressed('g')) {
		console.log('here');
		this.app.setScreen(RaceScreen);
	}
});
//jQuery(IntroScreen.element).click(function() {console.log(IntroScreen.app.input);});
/*
IntroScreen.render = function(dt) {
	//console.log(this);
	jQuery(this.element).html('hello');
	if (this.input.pressed('g')) {
		this.app.setScreen(RaceScreen);
	}
};
*/
//IntroScreen.input = new THREEx.KeyboardState();
var RaceScreen = new Screen('race-screen');
var PauseScreen = new Screen('pause-screen');
var ResultsScreen = new Screen('results-screen');

var BikeGame = Application.extend({
	input: new THREEx.KeyboardState(),

	init: function() {
		this.setScreen(IntroScreen);
	}
});

var gInput = new THREEx.KeyboardState();

var game = new BikeGame();
game.run();

/*
var g_screen = null;
var input = new THREEx.KeyboardState();
function setScreen(scr) {
	if (g_screen != null) g_screen.hide();
	g_screen = scr;
	g_screen.setApp(this);
	if (g_screen != null) {
		g_screen.show();
	}
}
function render() {
	if (g_screen != null) {
		g_screen.render(1/60, input);
	}
	window.requestAnimationFrame(render);
}

setScreen(IntroScreen);
render();
*/