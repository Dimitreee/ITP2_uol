function SeekBarController(){
    this.seekBarElement = select('#seekBar');
    this.currentTimeElement = select('#currentTime');
    this.durationElement = select('#duration');

    this.draw = function() {
        push();
        if (sound.isPlaying()) {
            this.drawProgress(sound.currentTime());
            this.setCurrentTime(sound.currentTime());
        }
        pop();
    }

    this.drawProgress = function (time) {
        const percentage = (time / sound.duration() * 100);
        const fillColor = getCssPropertyValue('--ui-base');
        const backgroundColor = getCssPropertyValue('--colors--white--transparent');
        this.seekBarElement.style(
            'background',
            `linear-gradient(to right, ${fillColor} 0%, ${fillColor} ${percentage}%, ${backgroundColor} ${percentage}%, ${backgroundColor} 100%)`
        )
    }

    this.handleInput = function(e){
        if (sound.duration() > 0 && sound.isPlaying()) {
            sound.jump(sound.duration() * (e.target.value / 100));
        }
    }

    this.setCurrentTime = function(time){
        this.currentTimeElement.html(secondsToMinutes(time));
    }

    this.setDuration = function(time){
        this.durationElement.html(secondsToMinutes(time));
    }

    this.fastForward = () => {
        if (sound.isPlaying()) {
            const nextTime = sound.currentTime() + 5;

            if (nextTime < sound.duration()) {
                sound.jump(nextTime);
            }
        }
    }

    this.rewind = () =>{
        if (sound.isPlaying()) {
            const nextTime = sound.currentTime() - 5;

            sound.jump(nextTime > 0 ? nextTime : 0);
        }
    }

    this.debouncedHandleInput = debounce(this.handleInput.bind(this), 400);
    this.seekBarElement.input(this.debouncedHandleInput);
}



