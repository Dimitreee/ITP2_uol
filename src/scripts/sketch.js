//global for the controls and input
var controls = null;
//store visualisations in a container
var vis = null;
//variable for the p5 sound object
var sound = null;
//variable for p5 fast fourier transform
var fourier;
var shaders = {
	glow: null,
}

var store = new Store();

function preload(){
	shaders.glow = loadShader('src/assets/shaders/glow/glow.vert','src/assets/shaders/glow/glow.frag');
	shaders.fractal = loadShader('src/assets/shaders/fractal/fractal.vert','src/assets/shaders/fractal/fractal.frag');
	shaders.color = loadShader('src/assets/shaders/color/color.vert','src/assets/shaders/color/color.frag');
	shaders.pulse = loadShader('src/assets/shaders/pulse/pulse.vert','src/assets/shaders/pulse/pulse.frag');
	sound = loadSound('src/assets/drake.mp3');
}

function setup(){
	createCanvas(windowWidth, windowHeight, WEBGL);
	background(getCssPropertyValue('--gray--default'));

	controls = new Controls();
	fourier = new p5.FFT();
	vis = new Visualisations(
		[
			new GlPulse(),
			// new GlColor(),
			// new GlFractal(),
			// new GlGlow(),
			new Spectrum(),
			new WavePattern(),
			new Needles(),
		]
	);

	const {volume, loop} = getKeysFromStore()

	controls.init(volume, loop);
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
	resizeCanvas(windowWidth, windowHeight);
	if(vis.selectedVisual.hasOwnProperty('onResize')){
		vis.selectedVisual.onResize();
	}
}
