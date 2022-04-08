import selectors from './selectors';

export function hasCaptions() {
  const subtitlesBtnVisible = $(selectors.SUBTITLES_BUTTON).is(':visible');
  const subtitlesBtnEnabled = $(selectors.SUBTITLES_ICON).attr('fill-opacity') === '1';
  return subtitlesBtnVisible && subtitlesBtnEnabled;
}

export function getCurrentTime() {
  return $(selectors.VIDEO).currentTime;
}

export function showControls() {
  const videoPlayer = document.querySelector('#movie_player');
  const videoPlayerPosition = videoPlayer.getBoundingClientRect();

  // to show the video controls we fake a mousemove event on the video player
  videoPlayer.dispatchEvent(new MouseEvent('mousemove', {
    clientX: videoPlayerPosition.left + Math.round(Math.random() * 100),
    clientY: videoPlayerPosition.top + Math.round(Math.random() * 100),
  }));
}

export function hideControls() {
  const videoPlayer = document.querySelector('#movie_player');

  // to hide the video controls we fake a mouseleave event on the video player
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
