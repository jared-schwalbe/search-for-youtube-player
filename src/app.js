let query = '';             // current query in the search field
let transcript = [];        // parsed transcript with text and timestamps
let results = [];           // search results from the current query
let resultsIndex = -1;      // current index in the results array
let searchMenuInterval;     // interval for showing video controls while menu is open
let searchButtonInterval;   // interval for showing video controls while button is hovered

function parseTranscript() {
  transcript = $(selectors.TRANSCRIPT_ITEM).map((i, item) => {
    const text = $(item).find(selectors.TRANSCRIPT_TEXT)
      .text()
      .toLowerCase()
      .replace(/\[.*\]/g, '')
      .replace(/.*:/g, '')
      .replace(/[^A-Za-z0-9\n' ]/g, '')
      .replace('\n', ' ')
      .replace(/  +/g, ' ')
      .trim();

    const timestamp = $(item).find(selectors.TRANSCRIPT_TIMESTAMP)
      .text()
      .replace('\n', '')
      .trim()
      .split(':')
      .reduce((s, e, i, a) => s + parseInt(e) * Math.pow(60, a.length - i - 1), 0);

    return { text, timestamp };
  });
}

// easy way to keep the video controls shown in to fake a mouse move on the video player
function showVideoControls() {
  const videoPlayer = document.querySelector(selectors.VIDEO_PLAYER_ID);
  const videoPlayerPosition = videoPlayer.getBoundingClientRect();

  videoPlayer.dispatchEvent(new MouseEvent('mousemove', {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX: videoPlayerPosition.left + Math.round(Math.random() * 100),
    clientY: videoPlayerPosition.top + Math.round(Math.random() * 100),
  }));
}

function hideVideoControls() {
  const videoPlayer = document.querySelector(selectors.VIDEO_PLAYER_ID);

  videoPlayer.dispatchEvent(new MouseEvent('mouseleave'));
}

function searchTranscript() {
  const transcriptText = transcript.map((i, item) => item.text).get();
  const fullTranscript = transcriptText.join(' ');
  const timestamps = [];

  for (i = 0; i < fullTranscript.length; i++) {
    if (fullTranscript.substring(i, i + query.length) === query) {
      // to find the index in the transcript, join the array with the unique character '|'
      // and then count the number of occurences
      const index = transcriptText.join('|').substring(0, i).split('|').length - 1;
      timestamps.push(transcript[index].timestamp);
    }
  }

  return Array.from(new Set(timestamps));
}

function getSearchInput() {
  return $(selectors.SEARCH_INPUT).val().toLowerCase().trim();
}

function executeSearch(direction) {
  resultsIndex = -1;
  query = getSearchInput();
  results = searchTranscript();

  if (query === '' || !results.length) {
    updateSearchLabel(0, 0);
    return;
  }

  const currentTime = $(selectors.VIDEO).get(0).currentTime;

  if (direction === 'next') {
    resultsIndex = 0;
    for (i = 0; i < results.length; i++) {
      if (results[i] > currentTime) {
        resultsIndex = i;
        break;
      }
    }
  } else {
    resultsIndex = results.length - 1;
    for (i = results.length - 1; i >= 0; i--) {
      if (results[i] < currentTime) {
        resultsIndex = i;
        break;
      }
    }
  }

  updateSearchAndSeek();
}

// Injects the search menu after the settings menu. Then sets up the listeners for its children.
function insertSearchMenu() {
  $(selectors.SETTINGS_MENU).after(searchMenuHTML);

  $(selectors.SEARCH_INPUT).on('keydown', e => {
    if (getSearchInput() === '') {
      updateSearchLabel(0, 0);
    } else if (e.keyCode === 13) {
      e.preventDefault();
      executeSearch('next');
    }
    e.stopPropagation(); // IMPORTANT!! prevents shortcut keys
  });

  $(selectors.NEXT_BUTTON).on('click', () => {
    if (query !== getSearchInput() || resultsIndex === -1) {
      executeSearch('next');
    } else {
      if (resultsIndex === results.length - 1) {
        resultsIndex = 0;
      } else {
        resultsIndex++;
      }
      updateSearchAndSeek();
    }
  });

  $(selectors.PREV_BUTTON).on('click', () => {
    if (query !== getSearchInput() || resultsIndex === -1) {
      executeSearch('prev');
    } else {
      if (resultsIndex === 0) {
        resultsIndex = results.length - 1;
      } else {
        resultsIndex--;
      }
      updateSearchAndSeek();
    }
  });

  new ResizeSensor($(selectors.VIDEO_PLAYER), () => {
    if ($(selectors.SEARCH_MENU).is(':visible')) {
      // hide search menu when player resizes
      hideSearchMenu();
    }
  });

  if (document.webkitIsFullScreen) {
    $(selectors.SEARCH_MENU).addClass(classes.SEARCH_MENU_FULLSCREEN);
    $(selectors.SEARCH_LEFT_WRAPPER).addClass(classes.SEARCH_LEFT_WRAPPER_FULLSCREEN);
    $(selectors.SEARCH_RESULTS).addClass(classes.SEARCH_RESULTS_FULLSCREEN);
    $(selectors.PREV_BUTTON).addClass(classes.PREV_BUTTON_FULLSCREEN);
    $(selectors.NEXT_BUTTON).addClass(classes.NEXT_BUTTON_FULLSCREEN);
  }

  $(document).on('fullscreenchange', () => {
    // need the calculate and set the width again
    updateSearchLabel(resultsIndex + 1, results.length);
    // add/remove fullscreen styling 
    if (document.webkitIsFullScreen) {
      $(selectors.SEARCH_MENU).addClass(classes.SEARCH_MENU_FULLSCREEN);
      $(selectors.SEARCH_LEFT_WRAPPER).addClass(classes.SEARCH_LEFT_WRAPPER_FULLSCREEN);
      $(selectors.SEARCH_RESULTS).addClass(classes.SEARCH_RESULTS_FULLSCREEN);
      $(selectors.PREV_BUTTON).addClass(classes.PREV_BUTTON_FULLSCREEN);
      $(selectors.NEXT_BUTTON).addClass(classes.NEXT_BUTTON_FULLSCREEN);
    } else {
      $(selectors.SEARCH_MENU).removeClass(classes.SEARCH_MENU_FULLSCREEN);
      $(selectors.SEARCH_LEFT_WRAPPER).removeClass(classes.SEARCH_LEFT_WRAPPER_FULLSCREEN);
      $(selectors.SEARCH_RESULTS).removeClass(classes.SEARCH_RESULTS_FULLSCREEN);
      $(selectors.PREV_BUTTON).removeClass(classes.PREV_BUTTON_FULLSCREEN);
      $(selectors.NEXT_BUTTON).removeClass(classes.NEXT_BUTTON_FULLSCREEN);
    }
  });
}

function showSearchMenu() {
  const newBottom = $(selectors.SETTINGS_MENU).css('bottom');
  const controlsLeft = $(selectors.CHROME_BOTTOM).position().left;
  const searchBtnLeft = $(selectors.SEARCH_BUTTON).position().left;
  const searchBtnMidpt = $(selectors.SEARCH_BUTTON).outerWidth() / 2;
  const searchMenuMidpt = $(selectors.SEARCH_MENU).outerWidth() / 2;
  const newLeft = controlsLeft + searchBtnLeft + searchBtnMidpt - searchMenuMidpt;

  $(selectors.SEARCH_MENU).css({
    'bottom': newBottom,
    'left': `${newLeft}px`,
    'right': ''
  });

  $(selectors.SETTINGS_MENU).hide();
  $(selectors.SEARCH_MENU).show();

  updateSearchLabel(resultsIndex + 1, results.length);
  $(selectors.SEARCH_INPUT).focus();

  if (
    !$(selectors.SEARCH_INPUT).val() ||
    $(selectors.SEARCH_INPUT).val().trim() === '' ||
    $(selectors.SEARCH_RESULTS).text().trim() === ''
  ) {
    updateSearchLabel(0, 0);
  }

  $(selectors.TOOLTIP).css('opacity', '0');

  // keep video controls visible while menu is shown
  searchMenuInterval = setInterval(showVideoControls, 100);

  setTimeout(() => {
    $(document).on('click', '*', clickOutsideSearchMenu);
  }, 100);

  $(document).on('keyup', escapeSearchMenu);
}

function escapeSearchMenu(e) {
  if (e.keyCode === 27) {
    hideSearchMenu();
  }
}

function clickOutsideSearchMenu(e) {
  const eClass = $(e.target).attr('class');
  if (typeof eClass === 'undefined' || !eClass.includes('ytp-search')) {
    e.stopPropagation(); // this isn't working like I want it to :(
    hideSearchMenu();
  }
}

function hideSearchMenu() {
  $(selectors.SEARCH_MENU).hide();

  $(selectors.SEARCH_INPUT).val('');
  $(selectors.TOOLTIP).css('opacity', '');

  query = '';
  results = [];
  resultsIndex = -1;

  clearInterval(searchMenuInterval);
  hideVideoControls();

  $(document).unbind('click', clickOutsideSearchMenu);
  $(document).unbind('keyup', escapeSearchMenu);
}


function insertSearchButton() {
  const searchButton = document.createElement('button');
  $(searchButton).addClass(classes.BUTTON);
  $(searchButton).addClass(classes.SEARCH_BUTTON);
  $(searchButton).html(searchButtonHTML);

  $(searchButton).on('mouseover', () => {
    if ($(selectors.SETTINGS_MENU).is(':visible') || $(selectors.SEARCH_MENU).is(':visible')) {
      return;
    }

    if (!$(selectors.TOOLTIP_TEXT_WRAPPER).parent().hasClass(classes.TOOLTIP)) {
      $(selectors.TOOLTIP_TEXT_WRAPPER).parent().addClass(classes.TOOLTIP);
    }

    // keep video controls visible while menu is shown
    searchButtonInterval = setInterval(showVideoControls, 100);

    $(selectors.TOOLTIP).css({
      'display': 'block',
      'max-width': 'none',
      'opacity': '1',
      'text-align': 'center'
    });

    $(selectors.TOOLTIP_TEXT).text('Search transcript');
    $(selectors.TOOLTIP_TEXT).css({
      'display': 'block',
      'whitespace': 'nowrap'
    });

    if ($(selectors.TOOLTIP).hasClass(classes.PREVIEW)) {
      $(selectors.TOOLTIP).removeClass(classes.PREVIEW);
      $(selectors.TOOLTIP_BG).css('background', '');
    }

    const controlsLeft = $(selectors.CHROME_BOTTOM).position().left;
    const searchBtnLeft = $(selectors.SEARCH_BUTTON).position().left;
    const searchBtnMidpoint = $(selectors.SEARCH_BUTTON).outerWidth() / 2;
    const tooltipMidpoint = $(selectors.TOOLTIP).outerWidth() / 2;
    const newLeft = controlsLeft + searchBtnLeft + searchBtnMidpoint - tooltipMidpoint;

    const videoHeight = $(selectors.VIDEO_PLAYER).height();
    const offset = $(selectors.VIDEO_PLAYER).hasClass(classes.FULLSCREEN) ? 94 : 87;
    const newTop = videoHeight - offset;

    $(selectors.TOOLTIP).css({
      'left': `${newLeft}px`,
      'top': `${newTop}px`
    });

    setTimeout(() => {
      $(selectors.TOOLTIP).css('display', 'block');
    }, 100);
  });

  $(searchButton).on('mouseleave', () => {
    if ($(selectors.TOOLTIP).length) {
      $(selectors.TOOLTIP).css('display', 'none');
      clearInterval(searchButtonInterval);
      hideVideoControls();
    }
  });

  $(searchButton).on('click', e => {
    if (!$(selectors.SEARCH_MENU).is(':visible')) {
      showSearchMenu();
      $(selectors.TOOLTIP).hide();
    } else {
      hideSearchMenu();
    }
  });

  $(selectors.RIGHT_CONTROLS).prepend(searchButton);
}

function updateSearchLabel(current, total) {
  $(selectors.SEARCH_RESULTS).text(current + ' of ' + total);

  const searchMenuWidth = $(selectors.SEARCH_MENU).width();
  const searchRightWidth = $(selectors.SEARCH_RIGHT_WRAPPER).width();
  const newWidth = searchMenuWidth - searchRightWidth;

  $(selectors.SEARCH_LEFT_WRAPPER).css('width', `${newWidth}px`);
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

function updateSearchAndSeek() {
  updateSearchLabel(resultsIndex + 1, results.length);

  document.dispatchEvent(new CustomEvent('seek', {
    detail: {
      seconds: results[resultsIndex]
    }
  }));
}

function openTranscript() {
  $(selectors.TRANSCRIPT).attr('visibility', 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED');
  $(selectors.TRANSCRIPT).css({ position: 'absolute', visibility: 'hidden' });
}

function closeTranscript() {
  $(selectors.TRANSCRIPT).attr('visibility', 'ENGAGEMENT_PANEL_VISIBILITY_HIDDEN');
  $(selectors.TRANSCRIPT).css({ position: 'relative', visibility: 'inherit' });
}

function videoHasCaptions() {
  const subtitlesBtnVisible = $(selectors.SUBTITLES_BUTTON).is(':visible');
  const subtitlesBtnEnabled = $(selectors.SUBTITLES_ICON).attr('fill-opacity') === '1';
  return subtitlesBtnVisible && subtitlesBtnEnabled;
}

function addSearchControls() {
  if (videoHasCaptions()) {
    const transcriptInterval = setInterval(() => {
      if ($(selectors.TRANSCRIPT_ITEM).length) {
        clearInterval(transcriptInterval);
        parseTranscript();
        closeTranscript();
        if (!$(selectors.SEARCH_BUTTON).length) {
          insertSearchButton();
        }
        if (!$(selectors.SEARCH_MENU).length) {
          insertSearchMenu();
        }
      } else {
        openTranscript();
      }
    }, 100);
  } else {
    $(selectors.SEARCH_BUTTON).remove();
    $(selectors.SEARCH_MENU).remove();
  }
}

function setup() {
  // reset global variables
  query = '';
  transcript = [];
  results = [];
  resultsIndex = -1;
  clearInterval(searchMenuInterval);
  clearInterval(searchButtonInterval);

  // remove the html elements we added
  $(selectors.SEARCH_BUTTON).remove();
  $(selectors.SEARCH_MENU).remove();

  // begin now if the video is already playing or wait til after it finishes loading
  if ($(selectors.VIDEO).get(0).currentTime > 0) {
    addSearchControls();
  } else {
    $(selectors.VIDEO).on('loadedmetadata', addSearchControls);
  }
}

// inject our 'seek' custom event into the DOM
// this allows it to interact with the seekTo API on the video player
document.documentElement.setAttribute('onreset', `(${addSeekEvent})(${seekToSearchResult},${showVideoControls})`);
document.documentElement.dispatchEvent(new CustomEvent('reset'));

// run whenever youtube navigates to a new video
// but also run it now (onload)
window.addEventListener('yt-navigate-start', setup, true);
setup();
