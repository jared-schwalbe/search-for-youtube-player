import selectors from './selectors';

// need to move the transcript into view to get YouTube to load it
// but we still want to keep it hidden from the user
export function open() {
  $(selectors.TRANSCRIPT).attr('visibility', 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED');
  $(selectors.TRANSCRIPT).css({
    position: 'fixed',
    left: '0px',
    top: '0px',
    visibility: 'hidden',
  });
}

export function close() {
  $(selectors.TRANSCRIPT).attr('visibility', 'ENGAGEMENT_PANEL_VISIBILITY_HIDDEN');
  $(selectors.TRANSCRIPT).css({
    position: 'relative',
    left: '',
    top: '',
    visibility: 'inherit',
  });
}

export function isLoaded() {
  return $(selectors.TRANSCRIPT_ITEM).length > 0;
}

export function parse() {
  state.transcript = $(selectors.TRANSCRIPT_ITEM).map((_, item) => {
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
      .reduce((s, e, i, a) => s + parseInt(e, 10) * 60 ** (a.length - i - 1), 0);

    return { text, timestamp };
  });
}

export function find() {
  const transcriptText = state.transcript.map((i, item) => item.text).get();
  const fullTranscript = transcriptText.join(' ');
  const timestamps = [];

  for (let i = 0; i < fullTranscript.length; i++) {
    if (fullTranscript.substring(i, i + state.query.length) === state.query) {
      // to find the index in the transcript, join the array with the unique character '|'
      // and then simply count the number of occurences
      const index = transcriptText.join('|').substring(0, i).split('|').length - 1;
      timestamps.push(state.transcript[index].timestamp);
    }
  }

  return Array.from(new Set(timestamps));
}
