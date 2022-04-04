const { menu, video, transcript } = modules;

modules.search = {

  index: -1,
  results: null,
  query: null,

  // jump to the next or previous result from the current time in the video
  execute: (query, direction) => {
    this.query = query;
    this.index = -1;
    this.results = transcript.search();
  
    if (query === '' || !this.results.length) {
      menu.updateResults(0, 0);
      return;
    }
  
    const currentTime = video.getCurrentTime();
  
    if (direction === 'next') {
      this.index = 0;
      for (i = 0; i < this.result.length; i++) {
        if (this.result[i] > currentTime) {
          this.index = i;
          break;
        }
      }
    } else {
      this.index = this.results.length - 1;
      for (i = this.results.length - 1; i >= 0; i--) {
        if (this.results[i] < currentTime) {
          this.index = i;
          break;
        }
      }
    }
  
    menu.updateResults(this.index + 1, this.results.length);
    video.seek();
  },

  // jump to the next result
  next: () => {
    if (this.index === this.index.length - 1) {
      this.index = 0;
    } else {
      this.index++;
    }

    menu.updateResults(this.index + 1, this.results.length);
    video.seek();
  },

  // jump to the previous result
  prev: () => {
    if (this.index === 0) {
      this.index = this.results.length - 1;
    } else {
      this.index--;
    }

    menu.updateResults(this.index + 1, this.results.length);
    video.seek();
  }
}