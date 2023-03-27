var controls = null;
var vis = null;
var sound = null;
var fourier;
var shaders = {
	glow: null,
}

var canvasWidth = 0;
var canvasHeight = 0;
var initialPlaylistData = [
	{
		title: 'Amaranth Cove',
		src: 'src/assets/music/Amaranth_Cove.mp3',
	},
	{
		title: 'Drake first',
		src: 'src/assets/music/drake.mp3',
	},
	{
		title: 'Drake second',
		src: 'src/assets/music/drake2.mp3',
	},
	{
		title: 'Lofive',
		src: 'src/assets/music/Lofive.mp3',
	},
	{
		title: 'Shiruky',
		src: 'src/assets/music/Shiruky.mp3',
	},
	{
		title: 'Stomper reggae bit',
		src: 'src/assets/music/stomper_reggae_bit.mp3',
	},
]
var store = new Store();
var playlist = new PlaylistController(initialPlaylistData);

function preload(){
	shaders.glow = loadShader('src/assets/shaders/glow/glow.vert','src/assets/shaders/glow/glow.frag');
	shaders.fractal = loadShader('src/assets/shaders/fractal/fractal.vert','src/assets/shaders/fractal/fractal.frag');
	shaders.color = loadShader('src/assets/shaders/color/color.vert','src/assets/shaders/color/color.frag');
	shaders.pulse = loadShader('src/assets/shaders/pulse/pulse.vert','src/assets/shaders/pulse/pulse.frag');
	playlist.preload();
}

function setup(){
	const canvasContainer = document.getElementById('canvasContainer');
	canvasWidth = canvasContainer.offsetWidth;
	canvasHeight = canvasContainer.offsetHeight;
	const canvas = createCanvas(canvasWidth, canvasHeight, WEBGL);
	canvas.parent('canvasContainer');

	background(getCssPropertyValue('--gray--default'));
	playlist.init();
	controls = new Controls(canvas);
	fourier = new p5.FFT();

	// color, spectrum, wavepattern, needles
	vis = new Visualisations(
		[
			// new GlPulse(),
			new GlColor(),
			// new GlFractal(),
			// new GlGlow(),
			new Spectrum(),
			new WavePattern(),
			new Needles(),
		]
	);

	const {volume, loop} = getKeysFromStore()

	controls.init(volume, loop);
	select('.clock-container').hide();
}

function draw(){
	background(getCssPropertyValue('--gray--default'));
	vis.selectedVisual.draw();
	controls.draw();
}

// function mouseClicked(){
// 	controls.mousePressed();
// }

function keyPressed(){
	controls.keyPressed(keyCode);
}

//when the window has been resized. Resize canvas to fit
//if the visualisation needs to be resized call its onResize method
function windowResized(){
	const canvasContainer = document.getElementById('canvasContainer');
	canvasWidth = canvasContainer.offsetWidth;
	canvasHeight = canvasContainer.offsetHeight;
	resizeCanvas(canvasWidth, canvasHeight);

	if(vis.selectedVisual.hasOwnProperty('onResize')){
		vis.selectedVisual.onResize();
	}
}
