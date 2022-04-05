import classes from './classes.js';
import selectors from './selectors.js';
import * as menu from './menu.js';
import * as video from './video.js';

export async function insert() {
  if ($(selectors.SEARCH_BUTTON).length) {
    return;
  }

  // load html for the search button into the a new DOM element
  const searchButton = document.createElement('button');
  const html = await Promise.resolve($.get(chrome.runtime.getURL('html/searchButton.html')));
  $(searchButton).html(html);
  $(searchButton).addClass(classes.BUTTON);
  $(searchButton).addClass(classes.SEARCH_BUTTON);

  $(searchButton).on('click', e => {
    if (!$(selectors.SEARCH_MENU).is(':visible')) {
      $(selectors.TOOLTIP).hide();
      menu.show();
    } else {
      menu.hide();
    }
  });

  $(searchButton).on('mouseover', () => {
    if ($(selectors.SETTINGS_MENU).is(':visible') || $(selectors.SEARCH_MENU).is(':visible')) {
      return;
    }

    if (!$(selectors.TOOLTIP_TEXT_WRAPPER).parent().hasClass(classes.TOOLTIP)) {
      $(selectors.TOOLTIP_TEXT_WRAPPER).parent().addClass(classes.TOOLTIP);
    }

    // keep video controls visible while menu is shown
    state.showControlsInterval.button = setInterval(video.showControls, 100);

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

    // remove the "preview" image when still in the tooltip
    if ($(selectors.TOOLTIP).hasClass(classes.PREVIEW)) {
      $(selectors.TOOLTIP).removeClass(classes.PREVIEW);
      $(selectors.TOOLTIP_BG).css('background', '');
    }

    const controlsLeft = $(selectors.CHROME_BOTTOM).position().left;
    const searchBtnLeft = $(selectors.SEARCH_BUTTON).position().left;
    const searchBtnMidpoint = $(selectors.SEARCH_BUTTON).outerWidth() / 2;
    const tooltipMidpoint = document.webkitIsFullScreen ? 89 : 59;
    const left = controlsLeft + searchBtnLeft + searchBtnMidpoint - tooltipMidpoint;
  
    const videoHeight = $(selectors.VIDEO_PLAYER).height();
    const offset = document.webkitIsFullScreen ? 94 : 87;
    const top = videoHeight - offset;

    $(selectors.TOOLTIP).css({
      'left': `${left}px`,
      'top': `${top}px`
    });

    // transitioning from the timeline tooltip to the button tooltip causes it to be hidden
    // so just show it again after a brief delay (causes a flashing effect but whatever)
    setTimeout(() => {
      $(selectors.TOOLTIP).css('display', 'block');
    }, 100);
  });

  $(searchButton).on('mouseleave', () => {
    if ($(selectors.TOOLTIP).length) {
      $(selectors.TOOLTIP).css('display', 'none');
    }
    clearInterval(state.showControlsInterval.button);
    video.hideControls();
  });

  // finally, add the button to the DOM at the beginning of the video player's right controls
  $(selectors.RIGHT_CONTROLS).prepend(searchButton);
}

export function remove() {
  $(selectors.SEARCH_BUTTON).remove();
}
