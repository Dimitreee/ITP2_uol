function Controls(){
	this.playbackButton = select('#playbackButton');
	this.playIcon = select("#playIcon");
	this.pauseIcon = select("#pauseIcon");
	this.loopButton = select("#loopButton");
	this.loopIcon = select("#loopIcon");
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
		}
		pop()
	};

	this.playbackButton.mouseClicked(this.togglePlayback.bind(this));
	this.loopButton.mouseClicked(this.toggleLoop.bind(this));
}
