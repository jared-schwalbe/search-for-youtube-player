/**
 * Formats the time to YouTube's standrads given the amount of seconds.
 *
 * NOTE: Not sure if I'm going to still use this. It was for updating the time
 *       when the search menu is open and the user's mouse is off the video.
 *       But then I'd have to update on seek as well as update the damn
 *       progress bar so I should probably just find a better solution.
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
