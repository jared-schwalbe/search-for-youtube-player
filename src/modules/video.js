import selectors from './selectors';

export function hasCaptions() {
  const subtitlesBtnVisible = $(selectors.SUBTITLES_BUTTON).is(':visible');
  const subtitlesBtnEnabled = $(selectors.SUBTITLES_ICON).attr('fill-opacity') === '1';
  return subtitlesBtnVisible && subtitlesBtnEnabled;
}

export function isOnPage() {
  return $(selectors.VIDEO) && $(selectors.VIDEO).get(0);
}

export function getCurrentTime() {
  return $(selectors.VIDEO).get(0).currentTime;
}

// an easy way to show the video controls is to fake a mousemove event on the video player
export function showControls() {
  const videoPlayer = document.querySelector('#movie_player');
  const videoPlayerPosition = videoPlayer.getBoundingClientRect();

  videoPlayer.dispatchEvent(new MouseEvent('mousemove', {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX: videoPlayerPosition.left + Math.round(Math.random() * 100),
    clientY: videoPlayerPosition.top + Math.round(Math.random() * 100),
  }));
}

// and to hide the controls, simulate a mouseleave event
export function hideControls() {
  const videoPlayer = document.querySelector('#movie_player');

  videoPlayer.dispatchEvent(new MouseEvent('mouseleave'));
}

// the custom 'seek' event is added in app.js
export function seekToResult() {
  document.dispatchEvent(new CustomEvent('seek', {
    detail: {
      seconds: state.results[state.index],
    },
  }));
}
