import $ from 'jquery';

import selectors from './modules/selectors';
import * as button from './modules/button';
import * as menu from './modules/menu';
import * as video from './modules/video';
import * as transcript from './modules/transcript';

const initialState = {
  query: '',
  transcript: [],
  results: [],
  index: -1,
  showControlsInterval: {
    menu: null,
    button: null,
  },
};

window.$ = $;
window.jQuery = $;
window.state = { ...initialState };

// content scripts are executed in an "isolated world" environment
// so we need to inject this listener into the DOM so we can interact
// with the "main world" and access the video player's seekTo API
function addSeekEvent(showControls) {
  document.addEventListener('seek', (e) => {
    document.getElementById('movie_player').seekTo(e.detail.seconds);
    showControls();
  });
}

// utilize the unused 'reset' event to inject our custom 'seek' event into the DOM
document.documentElement.setAttribute('onreset', `(${addSeekEvent})(${video.showControls})`);
document.documentElement.dispatchEvent(new CustomEvent('reset'));

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
  clearInterval(state.showControlsInterval.menu);
  clearInterval(state.showControlsInterval.button);
  Object.assign(state, initialState);

  button.remove();
  menu.remove();

  if (window.location.pathname === '/watch') {
    // wait for the video controls to load
    // then it can take a sec for the subtitles to be enabled
    const subtitlesInterval = setInterval(() => {
      if ($(selectors.RIGHT_CONTROLS).length) {
        clearInterval(subtitlesInterval);
        setTimeout(addSearchControls, 500);
      }
    }, 100);
  }
}

window.addEventListener('yt-navigate-finish', setup, true);
