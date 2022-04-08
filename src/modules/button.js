import classes from './classes';
import selectors from './selectors';
import * as menu from './menu';
import * as video from './video';

export async function insert() {
  if ($(selectors.SEARCH_BUTTON).length) {
    return;
  }

  // load the html for the search button
  const html = await Promise.resolve($.get(chrome.runtime.getURL('html/searchButton.html')));
  $(selectors.RIGHT_CONTROLS).prepend(html);

  $(selectors.SEARCH_BUTTON).on('click', () => {
    if (!$(selectors.SEARCH_MENU).is(':visible')) {
      $(selectors.SEARCH_BUTTON).attr('aria-expanded', 'true');
      $(selectors.TOOLTIP).removeClass('ytp-force-show');
      $(selectors.TOOLTIP).hide();
      menu.show();
    } else {
      $(selectors.SEARCH_BUTTON).attr('aria-expanded', 'false');
      menu.hide();
    }
  });

  $(selectors.SEARCH_BUTTON).on('mouseover', () => {
    if ($(selectors.SETTINGS_MENU).is(':visible') || $(selectors.SEARCH_MENU).is(':visible')) {
      return;
    }

    if (!$(selectors.TOOLTIP_TEXT_WRAPPER).parent().hasClass(classes.TOOLTIP)) {
      $(selectors.TOOLTIP_TEXT_WRAPPER).parent().addClass(classes.TOOLTIP);
    }

    // keep video controls visible while menu is shown
    state.showControlsInterval.button = setInterval(video.showControls, 100);

    $(selectors.TOOLTIP).addClass('ytp-force-show');
    $(selectors.TOOLTIP).css({
      opacity: '1',
      'max-width': 'none',
      'text-align': 'center',
    });

    $(selectors.TOOLTIP_TEXT).text('Search transcript');
    $(selectors.TOOLTIP_TEXT).css({
      display: 'block',
      whitespace: 'nowrap',
    });

    // remove the "preview" image if it's in the tooltip
    if ($(selectors.TOOLTIP).hasClass(classes.PREVIEW)) {
      $(selectors.TOOLTIP).removeClass(classes.PREVIEW);
      $(selectors.TOOLTIP_BG).css('background', '');
    }

    // hide the "title" which can contain shortcut text
    $(selectors.TOOLTIP_TITLE).hide();

    const controlsLeft = $(selectors.CHROME_BOTTOM).position().left;
    const searchBtnLeft = $(selectors.SEARCH_BUTTON).position().left;
    const searchBtnMidpoint = $(selectors.SEARCH_BUTTON).outerWidth() / 2;
    const tooltipMidpoint = document.webkitIsFullScreen ? 89 : 59;
    const left = controlsLeft + searchBtnLeft + searchBtnMidpoint - tooltipMidpoint;

    const videoHeight = $(selectors.VIDEO_PLAYER).height();
    const offset = document.webkitIsFullScreen ? 94 : 87;
    const top = videoHeight - offset;

    $(selectors.TOOLTIP).css({
      left: `${left}px`,
      top: `${top}px`,
    });
  });

  $(selectors.SEARCH_BUTTON).on('mouseleave', () => {
    clearInterval(state.showControlsInterval.button);
    $(selectors.TOOLTIP).removeClass('ytp-force-show');
    $(selectors.TOOLTIP).css('display', 'none');
    video.hideControls();
  });
}

export function remove() {
  $(selectors.TOOLTIP).removeClass('ytp-force-show');
  $(selectors.TOOLTIP).hide();

  $(selectors.SEARCH_BUTTON).remove();
}
