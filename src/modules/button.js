const { classes, selectors, menu, video } = modules;

modules.button = {

  showControlsInterval: null,

  // inject the search button HTML into the video player
  insert: async () => {
    if ($(selectors.SEARCH_BUTTON).length) {
      return;
    }
  
    const searchButton = document.createElement('button');
    $(searchButton).addClass(classes.BUTTON);
    $(searchButton).addClass(classes.SEARCH_BUTTON);
  
    // load html for the search button into the new DOM element
    const html = await Promise.resolve($.get(chrome.runtime.getURL('src/html/searchButton.html')));
    $(searchButton).html(html);
  
    $(searchButton).on('mouseover', () => {
      if ($(selectors.SETTINGS_MENU).is(':visible') || $(selectors.SEARCH_MENU).is(':visible')) {
        return;
      }
  
      if (!$(selectors.TOOLTIP_TEXT_WRAPPER).parent().hasClass(classes.TOOLTIP)) {
        $(selectors.TOOLTIP_TEXT_WRAPPER).parent().addClass(classes.TOOLTIP);
      }
  
      // keep video controls visible while menu is shown
      this.showControlsInterval = setInterval(video.showControls, 100);
  
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
      const tooltipMidpoint = document.webkitIsFullScreen ? 89 : 59;
      const newLeft = controlsLeft + searchBtnLeft + searchBtnMidpoint - tooltipMidpoint;
    
      const videoHeight = $(selectors.VIDEO_PLAYER).height();
      const offset = document.webkitIsFullScreen ? 94 : 87;
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
        video.hideControls();
      }
    });
  
    $(searchButton).on('click', e => {
      if (!$(selectors.SEARCH_MENU).is(':visible')) {
        $(selectors.TOOLTIP).hide();
        menu.show();
      } else {
        menu.hide();
      }
    });
  
    $(selectors.RIGHT_CONTROLS).prepend(searchButton);
  },

  // remove the HTML element from the DOM
  remove: () => {
    $(selectors.SEARCH_BUTTON).remove();
  }
};
