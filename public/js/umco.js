(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var createAudioGraph = require("./create-audio-graph");

var connectCamera = require("./connect-camera");

var connectListeners = require("./connect-listeners");

var canvasContext = require("./canvas-context");

var getColoursFactory = require("./get-colours");

var fillBoxFactory = require("./fill-box");

var updateAudioGraphFactory = require("./update-audio-graph");

var avgColourCollator = require("./collators/avg-colour");

var opts = {
  width: 300,
  height: 300,
  rows: 3,
  columns: 3,
  waveform: "square",
  filter: "bandpass"
};

window.onload = function () {
  connectCamera(opts, function (err, video) {
    if (err) {// TODO
    } else {
      document.body.className = "started";
      var audioGraph = createAudioGraph(opts);
      var sourceCtx = canvasContext("#copy", opts);
      var targetCtx = canvasContext("#target", opts);
      var getColours = getColoursFactory(sourceCtx, opts);
      var fillBox = fillBoxFactory(targetCtx, opts);
      var updateAudioGraph = updateAudioGraphFactory(audioGraph, opts);
      connectListeners(opts);
      audioGraph.start();
      this.running = setInterval(function () {
        sourceCtx.drawImage(video, 0, 0, opts.width, opts.height);
        var colours = getColours(avgColourCollator);
        fillBox(colours);
        updateAudioGraph(colours);
      }, 40);
    }
  });
};

},{"./canvas-context":2,"./collators/avg-colour":3,"./connect-camera":4,"./connect-listeners":5,"./create-audio-graph":6,"./fill-box":7,"./get-colours":8,"./update-audio-graph":9}],2:[function(require,module,exports){
"use strict";

module.exports = function (selector, opts) {
  var width = opts.width,
      height = opts.height;
  var canvas = document.querySelector(selector);
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext("2d");
};

},{}],3:[function(require,module,exports){
"use strict";

module.exports = function avgColourCollator(data) {
  var dataPerPixel = 4;
  var length = data.data.length;
  var pixels = length / dataPerPixel;
  var i = 0,
      r = 0,
      g = 0,
      b = 0;

  while (i < length) {
    r += data.data[i];
    g += data.data[i + 1];
    b += data.data[i + 2];
    i += dataPerPixel;
  }

  return {
    r: r / pixels,
    g: g / pixels,
    b: b / pixels
  };
};

},{}],4:[function(require,module,exports){
"use strict";

module.exports = function connectCamera(opts, callback) {
  var MEDIA_CONSTRAINTS = {
    audio: false,
    video: {
      width: {
        ideal: opts.width
      },
      height: {
        ideal: opts.height
      }
    }
  };

  if (navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS).then(function (mediaStream) {
      var video = document.querySelector("#video");
      video.srcObject = mediaStream;

      video.onloadedmetadata = function () {
        video.play();
        video.muted = true;
        callback(null, video);
      };
    })["catch"](function (err) {
      callback(err);
    });
  } else {
    callback(new Error("navigator.mediaDevices not supported"));
  }
};

},{}],5:[function(require,module,exports){
"use strict";

module.exports = function connectListeners(opts) {
  function filterTypeChange(evt) {
    opts.filter = evt.target.value;
  }

  function oscillatorTypeChange(evt) {
    opts.waveform = evt.target.value;
  }

  var oscillatorTypeRadios = document.querySelectorAll('input[name="oscillatorType"]');

  for (var i = 0; i < oscillatorTypeRadios.length; i++) {
    oscillatorTypeRadios[i].onclick = oscillatorTypeChange;
  }

  oscillatorTypeRadios[0].click();
  var filterTypeRadios = document.querySelectorAll('input[name="filterType"]');

  for (var _i = 0; _i < filterTypeRadios.length; _i++) {
    filterTypeRadios[_i].onclick = filterTypeChange;
  }

  filterTypeRadios[0].click();
};

},{}],6:[function(require,module,exports){
"use strict";

module.exports = function createAudioGraph(opts) {
  var waveform = opts.waveform,
      filter = opts.filter;
  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  var oscillators = new Array(9);
  var filters = new Array(9);
  var gains = new Array(9);

  for (var index = 0; index < 9; index++) {
    oscillators[index] = audioCtx.createOscillator();
    oscillators[index].type = waveform;
    filters[index] = audioCtx.createBiquadFilter();
    filters[index].type = filter;
    gains[index] = audioCtx.createGain();
    oscillators[index].connect(filters[index]);
    filters[index].connect(gains[index]);
    gains[index].connect(audioCtx.destination);
  }

  function start() {
    oscillators.forEach(function (oscillator) {
      oscillator.start();
    });
  }

  return {
    audioCtx: audioCtx,
    oscillators: oscillators,
    filters: filters,
    gains: gains,
    start: start
  };
};

},{}],7:[function(require,module,exports){
"use strict";

module.exports = function fillBox(targetCtx, opts) {
  var rows = opts.rows,
      columns = opts.columns,
      width = opts.width,
      height = opts.height;
  var boxWidth = width / columns;
  var boxHeight = height / rows;
  return function (boxColours) {
    for (var boxY = 0; boxY < rows; boxY++) {
      for (var boxX = 0; boxX < columns; boxX++) {
        var startX = boxX * boxWidth;
        var startY = boxY * boxHeight;
        var colour = boxColours[rows * boxY + boxX];
        var r = colour.r,
            g = colour.g,
            b = colour.b;
        var rgb = "rgb(".concat(Math.floor(r), ",").concat(Math.floor(g), ",").concat(Math.floor(b), ")");
        targetCtx.fillStyle = rgb;
        targetCtx.fillRect(startX, startY, boxWidth, boxHeight);
        targetCtx.fill();
      }
    }
  };
};

},{}],8:[function(require,module,exports){
"use strict";

module.exports = function getColours(sourceCtx, opts) {
  var rows = opts.rows,
      columns = opts.columns,
      width = opts.width,
      height = opts.height;
  var boxWidth = width / columns;
  var boxHeight = height / rows;
  return function (collator) {
    var boxColours = new Array(rows * columns);

    for (var boxY = 0; boxY < rows; boxY++) {
      for (var boxX = 0; boxX < columns; boxX++) {
        var startX = boxX * boxWidth;
        var startY = boxY * boxHeight;
        var data = sourceCtx.getImageData(startX, startY, boxWidth, boxHeight);
        var collatedColour = collator(data);
        boxColours[rows * boxY + boxX] = collatedColour;
      }
    }

    return boxColours;
  };
};

},{}],9:[function(require,module,exports){
"use strict";

function scale(colour) {
  var scaled = colour / 256;
  return Math.pow(2.0, scaled);
}

function oscFreq(colour, octave) {
  return 80 * Math.pow(2, octave) * scale(colour);
}

function cutoffFreq(colour) {
  return 500 * scale(colour);
}

function q(colour) {
  return 0.5 + colour / 512;
}

module.exports = function (audioGraph, opts) {
  var audioCtx = audioGraph.audioCtx,
      oscillators = audioGraph.oscillators,
      filters = audioGraph.filters;
  return function (colours) {
    colours.forEach(function (colour, index) {
      var r = colour.r,
          g = colour.g,
          b = colour.b;
      var x = index % 3;
      var y = Math.floor(index / 3);

      if (oscillators[index].type !== opts.waveform) {
        oscillators[index].type = opts.waveform;
      }

      oscillators[index].frequency.setTargetAtTime(oscFreq(r, x), audioCtx.currentTime, 0.1);

      if (filters[index].type !== opts.filter) {
        filters[index].type = opts.filter;
      }

      filters[index].frequency.setTargetAtTime(cutoffFreq(g), audioCtx.currentTime, 0.1);
      filters[index].Q.setTargetAtTime(q(b), audioCtx.currentTime, 0.1);
    });
  };
};

},{}]},{},[1]);
