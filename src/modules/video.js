modules.video = {

  // dispatch our custom "seek" event
  seek: seconds => {
    document.dispatchEvent(new CustomEvent('seek', {
      detail: {
        seconds
      }
    }));
  },

  // an easy way to show the video controls is to fake a mousemove event on the video player
  showControls: () => {
    const videoPlayer = document.querySelector('#movie_player');
    const videoPlayerPosition = videoPlayer.getBoundingClientRect();
  
    
    videoPlayer.dispatchEvent(new MouseEvent('mousemove', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: videoPlayerPosition.left + Math.round(Math.random() * 100),
      clientY: videoPlayerPosition.top + Math.round(Math.random() * 100),
    }));
  },

  // simulate mouseleave event on the video player
  hideControls: () => {
    clearInterval(menu.showControlsInterval);
    clearInterval(button.showControlsInterval);

    const videoPlayer = document.querySelector('#movie_player');

    videoPlayer.dispatchEvent(new MouseEvent('mouseleave'));
  },

  // check if close captions are enabled
  hasCaptions: () => {
    const subtitlesBtnVisible = $(selectors.SUBTITLES_BUTTON).is(':visible');
    const subtitlesBtnEnabled = $(selectors.SUBTITLES_ICON).attr('fill-opacity') === '1';
    return subtitlesBtnVisible && subtitlesBtnEnabled;
  },

  // check if this page has a video on it
  isOnPage: () => {
    return $(selectors.VIDEO) && $(selectors.VIDEO).get(0);
  },

  // get the current time (in seconds) of the video
  getCurrentTime: () => {
    return $(selectors.VIDEO).get(0).currentTime
  },
};
