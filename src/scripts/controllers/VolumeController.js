function VolumeController(){
    this.volumeButton = select('#volumeButton');
    this.volumeIcon = select('#volumeIcon');
    this.muteIcon = select('#muteIcon');
    this.volumeBarElement = select('#volumeBar');
    this.prevVolumeState = 0;

    this.draw = function(){
        push();
        if (sound.isPlaying()) {
            const volume = sound.getVolume() * 100;

            this.volumeBarElement.value(volume);
            this.drawProgress(volume);
        }
        pop();
    }

    this.drawProgress = function(percentage){
        const fillColor = getCssPropertyValue('--ui-base');
        const backgroundColor = getCssPropertyValue('--colors--white--transparent');
        this.volumeBarElement.style(
            'background',
            `linear-gradient(to right, ${fillColor} 0%, ${fillColor} ${percentage}%, ${backgroundColor} ${percentage}%, ${backgroundColor} 100%)`
        )
    }

    this.handleInput = function(e){
        push();
        const nextVolumeState = e.target.value / 100;
        this.setVolume(nextVolumeState);
        pop();
    }

    this.setVolume = function(volume){
        sound.setVolume(volume);
        this.storeVolumeState(volume);
        this.volumeBarElement.value(volume * 100);
        this.drawProgress(volume * 100);
    }

    this.toggleVolume = function(){
        if (!sound.isPlaying()) {
            return;
        }

        if (sound.getVolume() === 0) {
            sound.setVolume(this.prevVolumeState || 1);
            this.volumeIcon.show();
            this.muteIcon.hide();
        } else {
            sound.setVolume(0);
            this.volumeIcon.hide();
            this.muteIcon.show();
        }
    }

    this.volumeDown = function(){
        if (!sound.isPlaying()) {
            return;
        }

        this.volumeIcon.show();
        this.muteIcon.hide();

        const nextVolume = sound.getVolume() - 0.05;
        sound.setVolume(nextVolume > 0 ? nextVolume : 0);
        this.storeVolumeState()
    }

    this.volumeUp = function(){
        if (!sound.isPlaying()) {
            return;
        }

        this.volumeIcon.show();
        this.muteIcon.hide();

        const nextVolume = sound.getVolume() + 0.05;
        sound.setVolume(nextVolume < 1 ? nextVolume : 1);
        this.storeVolumeState()
    }

    this.storeVolumeState = function(value){
        if (value) {
            this.prevVolumeState = value;

            store.setItem(
                'volume',
                { value }
            );
        } else {
            this.prevVolumeState = sound.getVolume();

            store.setItem(
                'volume',
                {
                    value: sound.getVolume()
                }
            );
        }
    }

    this.volumeButton.mouseClicked(this.toggleVolume.bind(this));
    this.volumeBarElement.input(this.handleInput.bind(this));
}
