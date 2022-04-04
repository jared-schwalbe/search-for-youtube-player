modules.transcript = {

  captions: null,

  // expand and move the transcript element into view but keep it visually hidden 
  open: () => {
    $(selectors.TRANSCRIPT).attr('visibility', 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED');
    $(selectors.TRANSCRIPT).css({
      position: 'fixed',
      left: '0px',
      top: '0px',
      visibility: 'hidden',
    });
  },

  // reset transcript element after it has been opened and parsed
  close: () => {
    $(selectors.TRANSCRIPT).attr('visibility', 'ENGAGEMENT_PANEL_VISIBILITY_HIDDEN');
    $(selectors.TRANSCRIPT).css({
      position: 'relative',
      left: '',
      top: '',
      visibility: 'inherit',
    });
  },

  // check if the transcript HTML has loaded yet
  isLoaded: () => {
    return $(selectors.TRANSCRIPT_ITEM).length > 0;
  },

  // iterative over the transcript's HTML elements and map them to text and timestamp pairs
  parse: () => {
    this.captions = $(selectors.TRANSCRIPT_ITEM).map((i, item) => {
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
  },

  // look for the query in the captions
  search: query => {
    const captionsText = captions.map((i, item) => item.text).get();
    const fullTranscript = captionsText.join(' ');
    const timestamps = [];
  
    for (i = 0; i < fullTranscript.length; i++) {
      if (fullTranscript.substring(i, i + query.length) === query) {
        // to find the index in the transcript, join the array with the unique character '|'
        // and then simply count the number of occurences
        const index = captionsText.join('|').substring(0, i).split('|').length - 1;
        timestamps.push(this.captions[index].timestamp);
      }
    }

    return Array.from(new Set(timestamps));
  }
}
