/**
 * Search for YouTube Player
 *
 * @author: Jared Schwalbe
 * @version: 1.0.1
 */

/**
 * Global variables
 */
var transcript = [];
var results = [];
var currQuery = '';
var currResult = -1;
var flag = 0;
var updateTimeInterval;

/**
 * Parses the HTML of the transcript found on the page and loads it into the
 * transcript array.
 *
 * @param transcriptHTML string of html tags
 */
var parseTranscript = function(transcriptHTML) {
    transcript = [];

    $(transcriptHTML).find('div.caption-line-text').each(function() {
        var time = $(this).parent().attr('data-time');
        var text = $(this).text();
        text = text.toLowerCase();
        text = text.replace(/\[.*\]/g, '');
        text = text.replace(/.*:/g, '');
        text = text.replace(/[^A-Za-z0-9\n' ]/g, '');
        text = text.replace('\n', ' ');
        text = text.replace(/  +/g, ' ');
        text = text.trim();

        transcript.push({
            time: Math.floor(time),
            text: text
        });
    });
}

/**
 * Searches the transcript array for all timestamps where the query is found.
 *
 * @param query string to search for
 * @return array of timestamps
 */
var searchTranscript = function(query) {
    query = query.toLowerCase();
    query = query.trim();

    var fullTranscriptBars = $.map(transcript, function(obj) { return obj.text; }).join('|');
    var fullTranscriptSpaces = fullTranscriptBars.replace(/\|/g, ' ');

    var indicies = [];
    for (i = 0; i < fullTranscriptSpaces.length; ++i) {
        if (fullTranscriptSpaces.substring(i, i + query.length) == query) {
            indicies.push(i);
        }
    }

    var returnArr = [];
    for (i = 0; i < indicies.length; i++) {
        var index = (fullTranscriptBars.substring(0, indicies[i]).match(/\|/g) || []).length;
        returnArr.push(transcript[index].time);
    }

    return returnArr;
}

/**
 * Performs the search, updates the UI.
 *
 * @param direction forward|backward
 */
var executeSearch = function(direction) {
    currQuery = $('.ytp-search-left-wrapper input').val().trim();

    if (currQuery === '') {
        updateSearchLabel(0, 0);
        return;
    }

    results = searchTranscript(currQuery);
    currentTime = $('video').get(0).currentTime;
    currResult = -1;

    if (direction == 'forward') {
        if (results.length > 0) currResult = 0;
        for (i = 0; i < results.length; i++) {
            if (results[i] >= currentTime) {
                currResult = i;
                break;
            }
        }
    } else {
        if (results.length > 0) currResult = results.length - 1;
        for (i = results.length - 1; i >= 0; i--) {
            if (results[i] <= currentTime) {
                currResult = i;
                break;
            }
        }
    }

    if (currResult == -1) {
        updateSearchLabel(0, 0);
    } else {
        updateSearchLabel(currResult + 1, results.length);
        $('video').get(0).currentTime = results[currResult];
        $('video').get(0).play();
    }
}

/**
 * Injects the search menu after the settings menu. Then sets up the listeners
 * for it's children.
 */
var insertSearchMenu = function() {
    var searchMenuHTML = `
        <div class="ytp-popup ytp-search-menu" data-layer="7" style="z-index: 69; will-change: width,height; display: none;">
            <div class="ytp-search-left-wrapper" style="float: left; overflow: hidden; width: auto;">
                <input class="ytp-search-input" placeholder="Search..." style="background: transparent; border: none; outline: none; font-family: Roboto,Arial,Helvetica,sans-serif; color: #FFF; width: 100%;" />
            </div>
            <div class="ytp-search-right-wrapper" style="float: right;">
                <span class="ytp-search-results" style="float: left; font-family: Roboto,Arial,Helvetica,sans-serif; color: #AAA;"></span>
                <button class="ytp-search-prev-btn" style="float: left; cursor: pointer; overflow: hidden;">
                    <img class="ytp-search" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMTAwJSIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgMzIgMzIiIHdpZHRoPSIxMDAlIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZmZmIiAvPjwvc3ZnPg==" style="transform: scaleX(-1)" />
                </button>
                <button class="ytp-search-next-btn" style="float: left; cursor: pointer; overflow: hidden;">
                    <img class="ytp-search" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMTAwJSIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgMzIgMzIiIHdpZHRoPSIxMDAlIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZmZmIiAvPjwvc3ZnPg==" />
                </button>
            </div>
        </div>
        <style>
            .ytp-search-menu {
                width: 240px;
                height: 30px;
                padding: 8px 15px 8px 15px;
            }
            .ytp-search-left-wrapper input {
                font-size: 13px;
                height: 26px;
            }
            .ytp-search-results {
                font-size: 13px;
                margin-top: 7px;
                margin-left: 12px;
                margin-right: 12px;
            }
            .ytp-search-prev-btn {
                margin-top: 7px;
                margin-right: 10px;
            }
            .ytp-search-next-btn {
                margin-top: 7px;
            }
            .ytp-search-next-btn img,
            .ytp-search-prev-btn img {
                width: 30px;
                height: 30px;
                margin: -10px;
                clip-path: inset(9px 11px 9px 11px);
            }

            .ytp-search-menu-fs {
                width: 340px;
                height: 40px;
                padding: 10px 18px 10px 18px;
            }
            .ytp-search-left-wrapper-fs input {
                font-size: 20px;
                height: 36px;
            }
            .ytp-search-results-fs {
                font-size: 20px;
                margin-top: 7px;
                margin-left: 12px;
                margin-right: 12px;
            }
            .ytp-search-prev-btn-fs {
                margin-top: 12px;
                margin-right: 10px;
            }
            .ytp-search-next-btn-fs {
                margin-top: 12px;
            }
            .ytp-search-next-btn-fs img,
            .ytp-search-prev-btn-fs img {
                width: 40px;
                height: 40px;
                margin: -12px;
                clip-path: inset(12px 15px 12px 15px);
            }
        </style>
    `;

    $('.ytp-settings-menu').after(searchMenuHTML);

    $('.ytp-search-left-wrapper input').on('keydown', function(e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            executeSearch('forward');
        }
        e.stopPropagation(); // IMPORTANT!! prevents shortcut keys
    });

    $('.ytp-search-next-btn').on('click', function() {
        if ($('.ytp-search-left-wrapper input').val().trim() == '') {
            updateSearchLabel(0, 0);
            return;
        }

        if (currQuery != $('.ytp-search-left-wrapper input').val().trim() || currResult == -1) {
            executeSearch('forward');
        } else {
            (currResult == results.length - 1) ? currResult = 0 : currResult++;
            updateSearchLabel(currResult + 1, results.length);
            $('video').get(0).currentTime = results[currResult];
            $('video').get(0).play();
        }
    });

    $('.ytp-search-prev-btn').on('click', function() {
        if ($('.ytp-search-left-wrapper input').val().trim() == '') {
            updateSearchLabel(0, 0);
            return;
        }

        if ($('.ytp-search-left-wrapper input').val().trim() != currQuery || currResult == -1) {
            executeSearch('backward');
        } else {
            (currResult == 0) ? currResult = results.length - 1 : currResult--;
            updateSearchLabel(currResult + 1, results.length);
            $('video').get(0).currentTime = results[currResult];
            $('video').get(0).play();
        }
    });

    new ResizeSensor($('.html5-video-player'), function() {
        if ($('.ytp-search-menu').is(':visible')) {
            hideSearchMenu();
            showSearchMenu();
        }
    });

    $(document).on ('webkitfullscreenchange', function() {
        if (document.webkitIsFullScreen) {
            $('.ytp-search-menu').addClass('ytp-search-menu-fs');
            $('.ytp-search-left-wrapper').addClass('ytp-search-left-wrapper-fs');
            $('.ytp-search-results').addClass('ytp-search-results-fs');
            $('.ytp-search-prev-btn').addClass('ytp-search-prev-btn-fs');
            $('.ytp-search-next-btn').addClass('ytp-search-next-btn-fs');
        } else {
            $('.ytp-search-menu').removeClass('ytp-search-menu-fs');
            $('.ytp-search-left-wrapper').removeClass('ytp-search-left-wrapper-fs');
            $('.ytp-search-results').removeClass('ytp-search-results-fs');
            $('.ytp-search-prev-btn').removeClass('ytp-search-prev-btn-fs');
            $('.ytp-search-next-btn').removeClass('ytp-search-next-btn-fs');
        }
    });
}

/**
 * Opens the search menu.
 */
var showSearchMenu = function() {
    var newBot = $('.ytp-settings-menu').css('bottom');
    var controlsLeft = $('.ytp-chrome-bottom').position().left;
    var searchBtnLeft = $('.ytp-search-button').position().left;
    var searchBtnMidpt = $('.ytp-search-button').outerWidth() / 2;
    var searchMenuMidpt = $('.ytp-search-menu').outerWidth() / 2;
    var newLeft = controlsLeft + searchBtnLeft + searchBtnMidpt - searchMenuMidpt;

    $('.ytp-search-menu').css({
        'bottom': newBot,
        'left': newLeft + 'px',
        'right': ''
    });

    $('.ytp-settings-menu').hide();
    $('.ytp-search-menu').show();

    updateSearchLabel(currResult + 1, results.length);
    $('.ytp-search-left-wrapper input').focus();

    if ($('.ytp-search-results').text().trim() == '' ||
        $('.ytp-search-left-wrapper input').val().trim() == '') {
        updateSearchLabel(0, 0);
    }

    $('.ytp-chrome-bottom').css('opacity', '1');
    $('.ytp-gradient-bottom').css('opacity', '1');
    $('.ytp-tooltip').css('opacity', '0');

    updateTimeInterval = setInterval(function() {
        var video = $('video').get(0);
        $('.ytp-time-current').text(formatTime(video.currentTime));
        var progressPercent = video.currentTime / video.duration;
        $('.ytp-play-progress').css('transform', 'scaleX(' + progressPercent + ')');
    }, 100);

    setTimeout(function() {
        $(document).on('click', '*', clickOutsideSearchMenu);
    }, 100);

    $(document).on('keyup', escSearchMenu);
}

/**
 * Listener function for esc when the search menu is open.
 * Gets binded in showSearchMenu() and unbinded in hideSearchMenu().
 */
var escSearchMenu = function(e) {
    if (e.keyCode == 27) hideSearchMenu();
}

/**
 * Listener function for clicking outside the search menu when the search
 * menu is open. Gets binded in showSearchMenu() and unbinded in hideSearchMenu().
 */
var clickOutsideSearchMenu = function(e) {
    var eClass = $(e.target).attr('class');
    if (typeof eClass === 'undefined' || !eClass.includes('ytp-search')) {
        e.stopPropagation(); // this isn't working like I want it to :(
        hideSearchMenu();
    }
}

/**
 * Closes the search menu.
 */
var hideSearchMenu = function() {
    $('.ytp-search-menu').hide();

    $('.ytp-chrome-bottom').css('opacity', '');
    $('.ytp-gradiant-bottom').css('opacity', '')
    $('.ytp-tooltip').css('opacity', '');

    clearInterval(updateTimeInterval);
    $(document).unbind('click', clickOutsideSearchMenu);
    $(document).unbind('keyup', escSearchMenu);
}

/**
 * Create the search button and set up it's listeners.
 */
var insertSearchButton = function() {
    var searchButton = document.createElement('button');
    $(searchButton).addClass('ytp-button ytp-search-button');
    $(searchButton).html('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="-250 -250 946.25 946.25"><g><path d="M318.75,280.5h-20.4l-7.649-7.65c25.5-28.05,40.8-66.3,40.8-107.1C331.5,73.95,257.55,0,165.75,0S0,73.95,0,165.75 S73.95,331.5,165.75,331.5c40.8,0,79.05-15.3,107.1-40.8l7.65,7.649v20.4L408,446.25L446.25,408L318.75,280.5z M165.75,280.5 C102,280.5,51,229.5,51,165.75S102,51,165.75,51S280.5,102,280.5,165.75S229.5,280.5,165.75,280.5z" id="cfytp-svg-40"/></g><use class="ytp-svg-shadow" xlink:href="#cfytp-svg-40"></use><use class="ytp-svg-fill" xlink:href="#cfytp-svg-40"></use></svg>');

    $(searchButton).on('mouseover', function() {
        if ($('.ytp-settings-menu').is(':visible')) return;
        if ($('.ytp-search-menu').is(':visible')) return;

        var tooltip = $('.ytp-tooltip');

        $(tooltip).css({
            'display': 'block',
            'max-width': 'none',
            'opacity': '1',
            'text-align': 'center'
        });

        $('.ytp-tooltip-text').text('Search Transcript');
        $('.ytp-tooltip-text').css({
            'display': 'block',
            'whitespace': 'nowrap'
        });

        if ($(tooltip).hasClass('ytp-preview')) {
            var originalTop = $(tooltip).position().top;
            var bgHeight = $('.ytp-tooltip-bg').outerHeight();
            var textHeight = $('.ytp-tooltip-text-wrapper').outerHeight();
            var tooltipPaddingTop = parseInt($(tooltip).css('padding-top').replace('px', ''));
            var tooltipPaddingBot = parseInt($(tooltip).css('padding-bottom').replace('px', ''));
            var newTop = originalTop + bgHeight - textHeight + tooltipPaddingTop + tooltipPaddingBot;

            $(tooltip).css('top', newTop + 'px');
            $(tooltip).removeClass('ytp-preview');
            $('.ytp-tooltip-bg').css('background', '');
        }

        var controlsLeft = $('.ytp-chrome-bottom').position().left;
        var searchBtnLeft = $('.ytp-search-button').position().left;
        var searchBtnMidpt = $('.ytp-search-button').outerWidth() / 2;
        var tooltipMidpt = $('.ytp-tooltip').outerWidth() / 2;
        var newLeft = controlsLeft + searchBtnLeft + searchBtnMidpt - tooltipMidpt;

        $(tooltip).css('left', newLeft + 'px');

        setTimeout(function() {
            $(tooltip).css('display', 'block');
        }, 100);
    });

    $(searchButton).on('mouseleave', function() {
        if ($('.ytp-tooltip').length > 0) {
            $('.ytp-tooltip').css('display', 'none');
        }
    });

    $(searchButton).on('click', function(e) {
        if (!$('.ytp-search-menu').is(':visible')) {
            showSearchMenu();
            $('.ytp-tooltip').hide();
        } else {
            hideSearchMenu();
            $('.ytp-search-button').trigger('mouseover');
        }
    });

    $('.ytp-right-controls').prepend(searchButton);
}

/**
 * Updates the search results and the width of the wrapper for the input field
 * in the search menu. For some reason, 'width: auto' wasn't working so this is
 * a hack to fix it.
 */
var updateSearchLabel = function(curr, total) {
    $('.ytp-search-results').text(curr + ' of ' + total);

    var searchMenuWidth = $('.ytp-search-menu').width();
    var searchRightWidth = $('.ytp-search-right-wrapper').width();
    var newWidth = searchMenuWidth - searchRightWidth;

    $('.ytp-search-left-wrapper').css('width', newWidth + 'px');
}

/**
 * Formats the time to YouTube's standards given the amount of seconds.
 */
var formatTime = function(seconds) {
    hours = Math.floor(seconds / 3600);
    minutes = Math.floor(seconds / 60);
    minutes = minutes % 60;
    seconds = Math.floor(seconds % 60);
    seconds = (seconds >= 10) ? seconds : "0" + seconds;

    output = "";
    if (hours > 0) {
    	output += hours + ":";
        if (minutes < 10) {
      	    output += "0" + minutes;
        } else {
      	    output += minutes;
        }
    } else {
    	output += minutes;
    }
    output += ":" + seconds;

    return output;
}

/**
 * Main entry point essentially. Fires when the tab URL changes.
 * This was the best solution I could come up with since YouTube pushes to the
 * history and doesn't actually refresh the page.
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    flag = 0;

    $('video').on('loadedmetadata', function() {
        (flag == 0) ? flag = 1 : flag = 2;

        if (flag == 1) {
            if ($('.ytp-search-menu').length) {
                $('.ytp-search-menu').remove();
            }
            if ($('.ytp-search-button').length) {
                $('.ytp-search-button').remove();
            }
            if ($('.ytp-subtitles-button').is(':visible')) {
                var loadTranscript = setInterval(function() {
                    if ($('#transcript-scrollbox').length) {
                        if ($('#transcript-scrollbox').html().length) {
                            clearInterval(loadTranscript);
                            parseTranscript($('#transcript-scrollbox').html());
                            if (!$('.ytp-search-button').length) {
                                insertSearchButton();
                            }
                            if (!$('.ytp-search-menu').length) {
                                insertSearchMenu();
                            }
                            currResult = -1;
                            currQuery = '';
                            clearInterval(updateTimeInterval);
                        }
                    } else {
                        $('#action-panel-overflow-button').click();
                        $('.action-panel-trigger-transcript').click();
                        $('#watch-action-panels').css('display', 'none');
                    }
                }, 100);
            }
        }
    });
});
