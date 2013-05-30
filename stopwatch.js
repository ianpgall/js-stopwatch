;(function (window, undefined) {
    function getNow() {
        var theDate = new Date();
        var theMs = theDate.getTime();
        return {
            theDate: theDate,
            theMs: theMs
        };
    }

    function padZero(val) {
        val = +(val || 0);
        if (val < 0) {
            val = 0;
        }
        if (val < 10) {
            val = "0" + val;
        }
        return val;
    }
  
	var defaults = {
		pad: true,			// whether to pad the numbers or not
		ticker: undefined	// function reference
	};
	
	var sw = function (opts) {
		/**** STATES ****/
		var started = false;
		var running = false;
		/**** END STATES ****/
		
		/**** INTERNAL SETTINGS ****/
		var settings = {};
		var padNum = true;
		var usingFunction = false;
		var tickRef = undefined;
		/**** END INTERNAL SETTINGS ****/
		
		var startDate = undefined;
		var startMs = undefined;
		var nowDate = undefined;
		var nowMs = undefined;
		var pauseDate = undefined;
		var pauseMs = undefined;
		var resumeDate = undefined;
		var resumeMs = undefined;
		
		var tickerTO = undefined;
		var pauseTimeSpent = 0;
		
		/**** OPTIONS ****/
		// Start with defaults
		var options = {};
		options.pad = defaults.pad;
		options.ticker = defaults.ticker;
		
		// Extend user options
		if (typeof opts === "object") {
			options.ticker = opts.ticker;
			options.pad = !!opts.pad;
		}
		
		// Set internal
		if (typeof options.ticker === "function") {
			settings.usingFunction = true;
			settings.tickRef = options.ticker;
		}
		settings.padNum = !!options.pad;
		/**** END OPTIONS ****/
		
		function tickerWrapper() {
			setNow();
			ticker();
		}
		
		function ticker() {
			var calcMillis = nowMs - startMs - pauseTimeSpent;
			var calcSeconds = calcMillis / 1000;
			var calcMinutes = calcSeconds / 60;
			var calcHours = calcMinutes / 60;
			
			var takenMillis = 0;
			
			var finalHours = Math.floor(calcHours);
			takenMillis += (finalHours * 60 * 60 * 1000);
			var finalMinutes = Math.floor(calcMinutes) - (finalHours * 60);
			takenMillis += (finalMinutes * 60 * 1000);
			var finalSeconds = Math.floor(calcSeconds) - (finalMinutes * 60);
			takenMillis += (finalSeconds * 1000);
			var finalMillis = Math.floor((calcMillis - takenMillis) / 10);
			
			tickerTO = setTimeout(tickerWrapper, 0);
			
			if (settings.usingFunction === true) {
				if (settings.padNum === true) {
					finalHours = padZero(finalHours);
					finalMinutes = padZero(finalMinutes);
					finalSeconds = padZero(finalSeconds);
					finalMillis = padZero(finalMillis);
				}
				Function.prototype.call.call(settings.tickRef, null, finalHours, finalMinutes, finalSeconds, finalMillis);
			}
		}
		
		function setStart() {
			var newStuff = getNow();
			startDate = newStuff.theDate;
			startMs = newStuff.theMs;
		}
		
		function setNow() {
			var newStuff = getNow();
			nowDate = newStuff.theDate;
			nowMs = newStuff.theMs;
		}
		
		function setPause() {
			var newStuff = getNow();
			pauseDate = newStuff.theDate;
			pauseMs = newStuff.theMs;
		}
		
		function setResume() {
			var newStuff = getNow();
			resumeDate = newStuff.theDate;
			resumeMs = newStuff.theMs;
		}
		
		function resetInternal() {
			running = false;
			started = false;
			
			startDate = undefined;
			startMs = undefined;
			pauseDate = undefined;
			pauseMs = undefined;
			resumeDate = undefined;
			resumeMs = undefined;
			
			pauseTimeSpent = 0;
		}
		
		this.isRunning = function () {
			return running;
		};
		
		this.isStarted = function () {
			return started;
		};
		
		this.startPause = function () {
			if (!running) {
				// Handle Start/Resume
				running = true;
				
				var hadStarted = started;
				
				if (!hadStarted) {
					// Handle Start
					started = true;
					setStart();
				}
				
				setNow();
				
				if (hadStarted) {
					// Handle Resume
					pauseTimeSpent += (nowMs - pauseMs);
				}
				
				ticker();
			} else {
				// Handle Pause
				running = false;
				clearTimeout(tickerTO);
				setPause();
			}
		};
		
		this.reset = function () {
			resetInternal();
			clearTimeout(tickerTO);
		}
	};
	
    window.StopWatch = sw;
})(window);
