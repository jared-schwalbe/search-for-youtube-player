let transcript = [];      // parsed transcript
let results = [];         // results from the current query
let searchQuery = '';     // current query in the search field
let searchResult = -1;    // current index in the results array

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

function searchTranscript(query) {
  const transcriptText = transcript.map((i, item) => item.text).get();
  const fullTranscript = transcriptText.join(' ');
  const timestamps = [];

  for (i = 0; i < fullTranscript.length; i++) {
    if (fullTranscript.substring(i, i + query.length) === query) {
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
  searchResult = -1;
  searchQuery = getSearchInput();
  results = searchTranscript(searchQuery);

  if (searchQuery === '' || !results.length) {
    updateSearchLabel(0, 0);
    return;
  }

  const currentTime = $(selectors.VIDEO).get(0).currentTime;

  if (direction === 'next') {
    searchResult = 0;
    for (i = 0; i < results.length; i++) {
      if (results[i] >= currentTime) {
        searchResult = i;
        break;
      }
    }
  } else {
    searchResult = results.length - 1;
    for (i = results.length - 1; i >= 0; i--) {
      if (results[i] <= currentTime) {
        searchResult = i;
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
    }
    if (e.keyCode === 13) {
      e.preventDefault();
      executeSearch('next');
    }
    e.stopPropagation(); // IMPORTANT!! prevents shortcut keys
  });

  $(selectors.NEXT_BUTTON).on('click', () => {
    if (searchQuery !== getSearchInput() || searchResult === -1) {
      executeSearch('next');
    } else {
      if (searchResult === results.length - 1) {
        searchResult = 0;
      } else {
        searchResult++;
      }
      updateSearchAndSeek();
    }
  });

  $(selectors.PREV_BUTTON).on('click', () => {
    if (searchQuery !== getSearchInput() || searchResult === -1) {
      executeSearch('prev');
    } else {
      if (searchResult === 0) {
        searchResult = results.length - 1;
      } else {
        searchResult--;
      }
      updateSearchAndSeek();
    }
  });

  // detect video player resizing
  new ResizeSensor($(selectors.VIDEO_PLAYER), () => {
    if ($(selectors.SEARCH_MENU).is(':visible')) {
      hideSearchMenu();
      showSearchMenu();
    }
  });

  if ($(selectors.VIDEO_PLAYER).hasClass(classes.FULLSCREEN)) {
    $(selectors.SEARCH_MENU).addClass(classes.SEARCH_MENU_FULLSCREEN);
    $(selectors.SEARCH_LEFT_WRAPPER).addClass(classes.SEARCH_LEFT_WRAPPER_FULLSCREEN);
    $(selectors.SEARCH_RESULTS).addClass(classes.SEARCH_RESULTS_FULLSCREEN);
    $(selectors.PREV_BUTTON).addClass(classes.PREV_BUTTON_FULLSCREEN);
    $(selectors.NEXT_BUTTON).addClass(classes.NEXT_BUTTON_FULLSCREEN);
  }

  // add/remove fullscreen styling
  $(document).on('fullscreenchange', () => {
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

  updateSearchLabel(searchResult + 1, results.length);
  $(selectors.SEARCH_INPUT).focus();

  if (
    !$(selectors.SEARCH_INPUT).val() ||
    $(selectors.SEARCH_INPUT).val().trim() === '' ||
    $(selectors.SEARCH_RESULTS).text().trim() === ''
  ) {
    updateSearchLabel(0, 0);
  }

  $(selectors.CHROME_BOTTOM).css('opacity', '1');
  $(selectors.GRADIANT_BOTTOM).css('opacity', '1');
  $(selectors.TOOLTIP).css('opacity', '0');

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

  $(selectors.CHROME_BOTTOM).css('opacity', '');
  $(selectors.GRADIANT_BOTTOM).css('opacity', '')
  $(selectors.TOOLTIP).css('opacity', '');

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

/**
 * Content scripts are executed in an "isolated world" environment.
 * So we need to inject this function into the DOM so it can interact
 * with the "main world" and access the video player's seekTo API.
 */
function seekToSearchResult(videoPlayerSelector, seconds) {
  document.querySelector(videoPlayerSelector).seekTo(seconds, true);
}

function updateSearchAndSeek() {
  updateSearchLabel(searchResult + 1, results.length);

  const videoPlayerSelector = selectors.VIDEO_PLAYER;
  const seconds = results[searchResult];

  // run our custom event to seek to the search result
  const injection = `(${seekToSearchResult})('${videoPlayerSelector}',${seconds})`;
  document.documentElement.setAttribute('onreset', injection);
  document.documentElement.dispatchEvent(new CustomEvent('reset'));
  document.documentElement.removeAttribute('onreset');
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

function run() {
  if (videoHasCaptions()) {
    const loadTranscript = setInterval(() => {
      if ($(selectors.TRANSCRIPT_ITEM).length) {
        clearInterval(loadTranscript);
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

function main() {
  // reset global variables
  transcript = [];
  results = [];
  searchQuery = '';
  searchResult = -1;

  // remove the search elements
  $(selectors.SEARCH_BUTTON).remove();
  $(selectors.SEARCH_MENU).remove();

  // run now if the video is already playing or after it finishes loading
  if ($(selectors.VIDEO).get(0).currentTime > 0) {
    run();
  } else {
    $(selectors.VIDEO).on('loadedmetadata', run);
  }
}

// run immediately (onload) and when youtube navigates to a new video
main();
window.addEventListener('yt-navigate-start', main, true);
