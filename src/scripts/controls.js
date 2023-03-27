function Controls(canvas){
	this.canvasInstance = canvas;
	this.playbackButton = select('#playbackButton');
	this.playIcon = select("#playIcon");
	this.pauseIcon = select("#pauseIcon");
	this.loopButton = select("#loopButton");
	this.loopIcon = select("#loopIcon");
	this.fullScreenButton = select("#fullScreenButton");

	this.seekBar = new SeekBarController();
	this.volumeController = new VolumeController();

	this.init = function(volume, isLooping){
		this.volumeController.setVolume(volume);

		if (isLooping) {
			this.toggleLoop();
		}
	}

	this.draw = function(){
		push()
		this.seekBar.draw();
		this.volumeController.draw();
		pop()
	};

	// refs: https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen
	this.canvasInstance.doubleClicked((e) => {
		e.preventDefault();
		e.stopPropagation();

		if (!document.fullscreenElement) {
			e.target.requestFullscreen().catch((err) => {
				alert(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
			});
		} else {
			document.exitFullscreen();
		}
	})

	this.canvasInstance.mouseClicked((e) => {
		e.preventDefault();
		e.stopPropagation();

		if (!sound.isPlaying()) {
			this.togglePlayback();
		}
	})

	this.togglePlayback = function(){
		if (sound.isPlaying()) {
			sound.pause();

			this.playIcon.show()
			this.pauseIcon.hide();
		} else {
			sound.play();

			this.playIcon.hide();
			this.pauseIcon.show();
		}

		this.seekBar.setDuration(sound.duration());
	}

	this.toggleLoop = function(){
		sound.setLoop(!sound.isLooping());
		this.loopIcon.toggleClass('active');
		store.setItem(
			'loop',
			{ value: sound.isLooping() }
		);
	}

	this.keyPressed = function(keycode){
		push()
		switch(keycode){
			case 32:
				if (document.activeElement) {
					document.activeElement.blur();
				}

				this.togglePlayback();
				break;
			case 76:
				this.toggleLoop();
				break;
			case 39:
				this.seekBar.fastForward();
				break;
			case 37:
				this.seekBar.rewind();
				break;
			case 77:
				this.volumeController.toggleVolume();
				break;
			case 38:
				this.volumeController.volumeUp();
				break;
			case 40:
				this.volumeController.volumeDown();
				break;
			case 49:
				vis.selectVisual('color');
				break;
			case 50:
				vis.selectVisual('spectrum');
				break;
			case 51:
				vis.selectVisual('wavepattern');
				break;
			case 52:
				vis.selectVisual('needles');
				break;

		}
		pop()
	};

	this.requestFullscreen = function(){
		const canvasContainer = document.querySelector('canvas');

		if (!document.fullscreenElement) {
			canvasContainer.requestFullscreen().catch((err) => {
				alert(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
			});
		} else {
			document.exitFullscreen();
		}
	}

	this.playbackButton.mouseClicked(this.togglePlayback.bind(this));
	this.loopButton.mouseClicked(this.toggleLoop.bind(this));
	this.fullScreenButton.mouseClicked(this.requestFullscreen.bind(this));
}
