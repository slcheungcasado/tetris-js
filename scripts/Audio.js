export class Audio {
  constructor(cssSelector, options = {}) {
    this.$audioEl = $(cssSelector);
    this.audio = this.$audioEl.get(0);
    this.audioName = this.audio.src.slice(this.audio.src.lastIndexOf("/") + 1);
    this._prevTimePlayed = null;
    for (let [key, value] of Object.entries(options)) {
      if (key in this.audio) {
        this.$audioEl.prop(key, value);
      }
    }
  }

  async play(resetOnPlay = true) {
    try {
      if (resetOnPlay && this.isPlaying()) {
        this.restart();
      }
      await this.audio.play();
      this._prevTimePlayed = new Date();
    } catch (e) {
      console.error("Could not play:", this);
      console.error(e);
    }
  }

  async playIfIntervalAtLeast(threshold = 0.2) {
    try {
      if (!this.isPlaying()) {
        this.play();
      } else {
        const currTime = new Date();
        const delta =
          (currTime.getTime() - this._prevTimePlayed.getTime()) / 1000;
        if (delta > threshold) {
          this.play();
          this._prevTimePlayed = new Date();
        }
      }
    } catch (e) {
      console.error("Could not play:", this);
      console.error(e);
    }
  }

  pause() {
    this.audio.pause();
  }

  loop(flag = false) {
    this.audio.loop = flag;
  }

  isPlaying() {
    return this.audio.currentTime > 0;
  }

  mute(flag = false) {
    this.audio.muted = flag;
  }

  setPlaySpeed(playbackRate = 1) {
    this.audio.playbackRate = playbackRate;
  }

  restart() {
    this.setPlaySpeed(1);
    this.audio.currentTime = 0;
  }
}
