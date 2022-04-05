import ResizeSensor from 'resize-sensor';

import classes from './classes.js';
import selectors from './selectors.js';
import * as video from './video.js';
import * as transcript from './transcript';

export async function insert() {
  if ($(selectors.SEARCH_MENU).length) {
    return;
  }

  // load html for the search menu
  const html = await Promise.resolve($.get(chrome.runtime.getURL('html/searchMenu.html')));
  $(selectors.SETTINGS_MENU).after(html);

  if (document.webkitIsFullScreen) {
    addFullscreenClasses();
  }

  $(document).on('fullscreenchange', () => {
    updateResults(); // resize the results width
    document.webkitIsFullScreen ? addFullscreenClasses() : removeFullscreenClasses();
  });

  $(selectors.SEARCH_INPUT).on('keydown', e => {
    e.stopPropagation(); // stop youtube's shortcut keys
    if (e.keyCode === 37 || e.keyCode === 39) {
      e.preventDefault(); // prevent left/right arrow key default behavior
    }
  });

  $(selectors.SEARCH_INPUT).on('keyup', e => {
    if (e.currentTarget.value === '') {
      updateResults(0, 0);
    } else if (e.keyCode === 13) {
      search('next');
    } else if (e.keyCode === 37 && state.index !== -1) {
      prev();
    } else if (e.keyCode === 39 && state.index !== -1) {
      next();
    }
  });

  $(selectors.PREV_BUTTON).on('click', () => {
    if (state.query !== getInputValue() || state.index === -1) {
      search('prev');
    } else {
      prev();
    }
  });

  $(selectors.NEXT_BUTTON).on('click', () => {
    if (state.query !== getInputValue() || state.index === -1) {
      search('next');
    } else {
      next();
    }
  });

  // hide search menu when player resizes
  new ResizeSensor($(selectors.VIDEO_PLAYER), () => {
    if ($(selectors.SEARCH_MENU).is(':visible')) {
      hide();
    }
  });
}

export function remove() {
  $(selectors.SEARCH_MENU).remove();
}

export function show() {
  const controlsLeft = $(selectors.CHROME_BOTTOM).position().left;
  const searchBtnLeft = $(selectors.SEARCH_BUTTON).position().left;
  const searchBtnMidpt = $(selectors.SEARCH_BUTTON).outerWidth() / 2;
  const searchMenuMidpt = $(selectors.SEARCH_MENU).outerWidth() / 2;
  const bottom = $(selectors.SETTINGS_MENU).css('bottom');
  const left = controlsLeft + searchBtnLeft + searchBtnMidpt - searchMenuMidpt;

  $(selectors.SEARCH_MENU).css({
    'right': '',
    'left': `${left}px`,
    'bottom': bottom
  });

  $(selectors.SETTINGS_MENU).hide();
  $(selectors.SEARCH_MENU).show();
  $(selectors.SEARCH_INPUT).focus();
  updateResults(0, 0);

  // keep video controls visible while menu is shown
  state.showControlsInterval.menu = setInterval(video.showControls, 100);

  $(selectors.CHROME_BOTTOM).css('opacity', '1');
  $(selectors.GRADIANT_BOTTOM).css('opacity', '1');
  $(selectors.TOOLTIP).css('opacity', '0');

  $(document).on('keyup', onEscape);

  setTimeout(() => {
    $(document).on('click', '*', onClickOutside);
  }, 100);
}

export function hide() {
  state.query = '';
  state.index = -1;
  state.results = [];

  $(selectors.SEARCH_MENU).hide();
  $(selectors.SEARCH_INPUT).val('');
  
  $(selectors.CHROME_BOTTOM).css('opacity', '');
  $(selectors.GRADIANT_BOTTOM).css('opacity', '');
  $(selectors.TOOLTIP).css('opacity', '');

  clearInterval(state.showControlsInterval.menu);
  video.hideControls();

  $(document).unbind('keyup', onEscape);
  $(document).unbind('click', onClickOutside);
}

function search(direction) {
  state.query = getInputValue();
  state.index = -1;
  state.results = transcript.find();

  if (state.query === '' || !state.results.length) {
    updateResults(0, 0);
    return;
  }

  const currentTime = video.getCurrentTime();

  if (direction === 'next') {
    state.index = 0;
    for (let i = 0; i < state.results.length; i++) {
      if (state.results[i] > currentTime) {
        state.index = i;
        break;
      }
    }
  } else {
    state.index = state.results.length - 1;
    for (let i = state.results.length - 1; i >= 0; i--) {
      if (state.results[i] < currentTime) {
        state.index = i;
        break;
      }
    }
  }

  updateResults();
  video.seekToResult();
}

function next() {
  if (state.index === state.results.length - 1) {
    state.index = 0;
  } else {
    state.index++;
  }

  updateResults();
  video.seekToResult();
}

function prev() {
  if (state.index === 0) {
    state.index = state.results.length - 1;
  } else {
    state.index--;
  }

  updateResults();
  video.seekToResult();
}

export function updateResults(current, total) {
  if (current !== undefined && total !== undefined) {
    $(selectors.SEARCH_RESULTS).text(`${current} of ${total}`);
  } else {
    $(selectors.SEARCH_RESULTS).text(`${state.index + 1} of ${state.results.length}`);
  }

  const searchMenuWidth = $(selectors.SEARCH_MENU).width();
  const searchRightWidth = $(selectors.SEARCH_RIGHT_WRAPPER).width();
  const width = searchMenuWidth - searchRightWidth;

  $(selectors.SEARCH_LEFT_WRAPPER).css('width', `${width}px`);
}

export function getInputValue() {
  return $(selectors.SEARCH_INPUT).val().toLowerCase().trim();
}

function onEscape(event) {
  if (event.keyCode === 27) {
    hide();
  }
}

function onClickOutside(event) {
  const eClass = $(event.target).attr('class');
  if (typeof eClass === 'undefined' || !eClass.includes('ytp-search')) {
    hide();
  }
}

function addFullscreenClasses() {
  $(selectors.SEARCH_MENU).addClass(classes.SEARCH_MENU_FULLSCREEN);
  $(selectors.SEARCH_LEFT_WRAPPER).addClass(classes.SEARCH_LEFT_WRAPPER_FULLSCREEN);
  $(selectors.SEARCH_RESULTS).addClass(classes.SEARCH_RESULTS_FULLSCREEN);
  $(selectors.PREV_BUTTON).addClass(classes.PREV_BUTTON_FULLSCREEN);
  $(selectors.NEXT_BUTTON).addClass(classes.NEXT_BUTTON_FULLSCREEN);
}

function removeFullscreenClasses() {
  $(selectors.SEARCH_MENU).removeClass(classes.SEARCH_MENU_FULLSCREEN);
  $(selectors.SEARCH_LEFT_WRAPPER).removeClass(classes.SEARCH_LEFT_WRAPPER_FULLSCREEN);
  $(selectors.SEARCH_RESULTS).removeClass(classes.SEARCH_RESULTS_FULLSCREEN);
  $(selectors.PREV_BUTTON).removeClass(classes.PREV_BUTTON_FULLSCREEN);
  $(selectors.NEXT_BUTTON).removeClass(classes.NEXT_BUTTON_FULLSCREEN);
}
