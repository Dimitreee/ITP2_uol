function Spectrum(){
	this.name = "spectrum";

	this.draw = function(){
		push();
		var spectrum = fourier.analyze();
		noStroke();
		fill(0,255,0)

		const width = window.innerWidth * 2;
		const height = window.innerHeight / 2;
		for (var i = 0; i < spectrum.length; i++){
			var x = map(i, 0, spectrum.length, 0, width);
		    var h = -height + map(spectrum[i], 0, 255, height, 0);

		    rect(x, window.innerHeight - 64, width / spectrum.length, h );
  		}

		pop();
	};
}
