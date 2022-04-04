const { classes, selectors, search } = modules;

modules.menu = {

  showControlsInterval: null,

   // inject the search menu HTML into the video player
  insert: async () => {
    if ($(selectors.SEARCH_MENU).length) {
      return;
    }

    const html = await Promise.resolve($.get(chrome.runtime.getURL('src/html/searchMenu.html')));
    $(selectors.SETTINGS_MENU).after(html);
  
    $(selectors.SEARCH_INPUT).on('keydown', e => {
      e.stopPropagation(); // prevents shortcut keys
      if (e.keyCode === 37 || e.keyCode === 39) {
        e.preventDefault(); // stops cursor from moving left/right when arrow keys are pressed
      }
    });
  
    $(selectors.SEARCH_INPUT).on('keyup', e => {
      if (e.currentTarget.value === '') {
        this.updateResults(0, 0);
      } else if (e.keyCode === 13) {
        search.execute('next');
      } else if (e.keyCode === 39 && search.index >= 0) {
        search.next();
      } else if (e.keyCode === 37 && search.index >= 0) {
        search.prev();
      }
    })
  
    $(selectors.NEXT_BUTTON).on('click', () => {
      if (search.query !== menu.getInput() || search.index === -1) {
        search.execute('next');
      } else {
        search.next();
      }
    });
  
    $(selectors.PREV_BUTTON).on('click', () => {
      if (search.query !== menu.getInput() || search.index === -1) {
        search.execute('prev');
      } else {
        search.prev();
      }
    });
  
    // hide search menu when player resizes
    new ResizeSensor($(selectors.VIDEO_PLAYER), () => {
      if ($(selectors.SEARCH_MENU).is(':visible')) {
        this.hide();
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
      updateSearchLabel(search.index + 1, search.results.length);
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
  },

  remove: () => {
    $(selectors.SEARCH_MENU).remove();
  },

  show: () => {
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
  
    this.updateResults(search.index + 1, search.results.length);
    $(selectors.SEARCH_INPUT).focus();
  
    if (
      !$(selectors.SEARCH_INPUT).val() ||
      $(selectors.SEARCH_INPUT).val().trim() === '' ||
      $(selectors.SEARCH_RESULTS).text().trim() === ''
    ) {
      this.updateResults(0, 0);
    }
  
    $(selectors.TOOLTIP).css('opacity', '0');
  
    // keep video controls visible while menu is shown
    this.showControlsInterval = setInterval(video.showControls, 100);
  
    $(document).on('keyup', this.escapeBinding);
  
    setTimeout(() => {
      $(document).on('click', '*', clickBinding);
    }, 100);
  },

  hide: () => {
    $(selectors.SEARCH_MENU).hide();
  
    $(selectors.SEARCH_INPUT).val('');
    $(selectors.TOOLTIP).css('opacity', '');
  
    search.query = '';
    search.index = -1;
    search.results = [];
  
    video.hideControls();
  
    $(document).unbind('click', clickBinding);
    $(document).unbind('keyup', escapeBinding);
  },

  updateResults: (current, total) => {
    $(selectors.SEARCH_RESULTS).text(current + ' of ' + total);
  
    const searchMenuWidth = $(selectors.SEARCH_MENU).width();
    const searchRightWidth = $(selectors.SEARCH_RIGHT_WRAPPER).width();
    const newWidth = searchMenuWidth - searchRightWidth;
  
    $(selectors.SEARCH_LEFT_WRAPPER).css('width', `${newWidth}px`);
  },

  getInput: () => {
    return $(selectors.SEARCH_INPUT).val().toLowerCase().trim();
  },

  escapeBinding: e => {
    if (e.keyCode === 27) {
      this.hide();
    }
  },
  
  clickBinding: e => {
    const eClass = $(e.target).attr('class');
    if (typeof eClass === 'undefined' || !eClass.includes('ytp-search')) {
      this.hide();
    }
  }
};
