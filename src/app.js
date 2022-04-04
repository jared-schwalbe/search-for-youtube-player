const { button, menu, search, transcript, video } = modules;

function getSearchInput() {
  return $(selectors.SEARCH_INPUT).val().toLowerCase().trim();
}

// Content scripts are executed in an "isolated world" environment.
// So we need to inject this function into the DOM so it can interact
// with the "main world" and access the video player's seekTo API.
function seekToSearchResult(videoPlayerSelector, seconds) {
  document.querySelector(videoPlayerSelector).seekTo(seconds);
}

function addSeekEvent(seekFn, showControlsFn) {
  document.addEventListener('seek', e => {
    seekFn('#movie_player', e.detail.seconds);
    showControlsFn();
  });
}

function addSearchControls() {
  if (video.hasCaptions()) {
    const openTranscript = setInterval(() => {
      if (transcript.isLoaded()) {
        clearInterval(openTranscript);
        transcript.parse();
        transcript.close();
        button.insert();
        menu.insert();
      } else {
        transcript.open();
      }
    }, 100);
  } else {
    button.remove();
    menu.remove();
  }
}

function setup() {
  // reset application state
  search.query = '';
  search.index = -1;
  search.results = null;
  transcript.captions = [];
  clearInterval(menu.showControlsInterval);
  clearInterval(button.showControlsInterval);

  button.remove();
  menu.remove();

  $(selectors.VIDEO).unbind('loadedmetadata', addSearchControls);

  // begin now if the video is already playing or wait until after it finishes loading
  if (video.isOnPage()) {
    if (video.getCurrentTime() > 0) {
      addSearchControls();
    } else {
      $(selectors.VIDEO).on('loadedmetadata', addSearchControls);
    }
  }
}

// utilize the unused 'reset' event to inject our 'seek' custom event into the DOM
// this allows it to interact with the seekTo API on the video player element
document.documentElement.setAttribute('onreset', `(${addSeekEvent})(${seekToSearchResult},${video.showControls})`);
document.documentElement.dispatchEvent(new CustomEvent('reset'));

// run immediately (onload)
setup();

// and run whenever youtube navigates to a new video
window.addEventListener('yt-navigate-start', setup, true);
