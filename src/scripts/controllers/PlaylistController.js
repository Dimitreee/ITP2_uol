function PlaylistController(playlistData){
    this.playlistData = [];
    this.playlistMeta = [...playlistData]
    this.activeSong = 0;

    this.preload = function () {
        for (let i = 0; i < playlistData.length; i++) {
            const element = playlistData[i];
            this.playlistData.push(loadSound(element.src));
        }
    }

    this.playAudio = function(e) {
        if (e.target.dataset.index && e.target.dataset.index !== this.activeSong) {
            this.activeSong = Number(e.target.dataset.index);
            sound.stop();
            sound = this.playlistData[this.activeSong];
            controls.togglePlayback()
        }
    }

    this.init = function () {
        this.playlisContaiener = select('#playlist');
        sound = this.playlistData[0]
        this.drawList();
        this.playlisContaiener.mouseClicked(this.playAudio.bind(this));
    }

    this.drawList = function () {
        this.playlisContaiener.drop();
        for (let i = 0; i < this.playlistMeta.length; i++) {
            const element = this.playlistMeta[i];
            let playlistItem = createDiv(element.title);
            playlistItem.class('playlistItem');
            playlistItem.attribute('data-index', i);

            this.playlisContaiener.child(playlistItem)
        }
    }
}
