(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var createAudioGraph = require("./create-audio-graph");

var connectCamera = require("./connect-camera");

var connectListeners = require("./connect-listeners");

var getColoursFactory = require("./get-colours");

var fillBoxFactory = require("./fill-box");

var updateAudioGraphFactory = require("./update-audio-graph");

var _require = require("./collators"),
    avgColour = _require.avgColour,
    centreColour = _require.centreColour;

var model = require("./model"); // debug!!


model.listen(function (x) {
  console.log("Model change", x);
});

var getCollator = function getCollator() {
  return model.collator = "centre" ? centreColour : avgColour;
};

window.onload = function () {
  connectCamera(function (err, video) {
    if (err) {// TODO
    } else {
      document.body.className = "started";
      var audioGraph = createAudioGraph(model);
      var getColours = getColoursFactory("#copy", video);
      var fillBox = fillBoxFactory("#target");

      var _updateAudioGraphFact = updateAudioGraphFactory(audioGraph, model),
          updateColours = _updateAudioGraphFact.updateColours;

      connectListeners(model);
      audioGraph.start();
      setInterval(function () {
        var colours = getColours(getCollator());
        fillBox(colours);
        updateColours(colours);
      }, 1000); // during dev, keep this high
    }
  });
};

},{"./collators":5,"./connect-camera":6,"./connect-listeners":7,"./create-audio-graph":9,"./fill-box":10,"./get-colours":11,"./model":12,"./update-audio-graph":13}],2:[function(require,module,exports){
"use strict";

var _require = require('./constants'),
    width = _require.width,
    height = _require.height;

module.exports = function (selector) {
  var canvas = document.querySelector(selector);
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext("2d");
};

},{"./constants":8}],3:[function(require,module,exports){
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

module.exports = function centreColourCollator(data) {
  var dataPerPixel = 4;
  var length = data.data.length;
  var i = Math.floor(length / dataPerPixel / 2) * dataPerPixel;
  return {
    r: data.data[i],
    g: data.data[i + 1],
    b: data.data[i + 2]
  };
};

},{}],5:[function(require,module,exports){
"use strict";

module.exports = {
  avgColour: require('./avg-colour'),
  centreColour: require('./centre-colour')
};

},{"./avg-colour":3,"./centre-colour":4}],6:[function(require,module,exports){
"use strict";

var _require = require('./constants'),
    width = _require.width,
    height = _require.height;

module.exports = function connectCamera(callback) {
  var MEDIA_CONSTRAINTS = {
    audio: false,
    video: {
      width: {
        ideal: width
      },
      height: {
        ideal: height
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

},{"./constants":8}],7:[function(require,module,exports){
"use strict";

function connectRadioValue(model, radioName) {
  model.register(radioName);
  var radios = document.querySelectorAll("input[name=\"".concat(radioName, "\"]"));

  var radioValue = function radioValue(evt) {
    model[radioName] = evt.target.value;
  };

  for (var i = 0; i < radios.length; i++) {
    radios[i].onclick = radioValue;
  }

  radios[0].click();
}

function connectRotatingValue(model, buttonId, items) {
  model.register(buttonId);
  var element = document.querySelector("#" + buttonId);
  var index = -1;

  var rotatingValue = function rotatingValue() {
    index = (index + 1) % items.length;
    model[buttonId] = items[index];
    element.value = items[index];
  };

  element.onclick = rotatingValue;
  element.click();
}

module.exports = function connectListeners(model, audioGraph) {
  connectRadioValue(model, "oscillatorType");
  connectRadioValue(model, "filterType");
  var colourOrder = ["r", "g", "b"];
  connectRotatingValue(model, "oscillatorColour", colourOrder);
  connectRotatingValue(model, "filterColour", colourOrder);
  connectRotatingValue(model, "resonanceColour", colourOrder);
  var collatorOrder = ["avg", "centre"];
  connectRotatingValue(model, "collator", collatorOrder);
  var ringModOrder = ["off", "horizontal", "vertical"];
  connectRotatingValue(model, "ringMod", ringModOrder);
  var offOn = ["off", "on"];
  connectRotatingValue(model, "pitchRow", offOn);
  connectRotatingValue(model, "connected", offOn);
};

},{}],8:[function(require,module,exports){
"use strict";

module.exports = {
  width: 300,
  height: 300,
  rows: 3,
  columns: 3
};

},{}],9:[function(require,module,exports){
"use strict";

var _require = require('./constants'),
    rows = _require.rows,
    columns = _require.columns;

var asIndex = function asIndex(row, col) {
  return row * columns + col;
};

var asRowCol = function asRowCol(index) {
  return {
    row: Math.floor(index / columns),
    col: index % columns
  };
};

module.exports = function createAudioGraph(model) {
  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  var total = rows * columns;
  var oscillators = new Array(total);
  var filters = new Array(total);
  var gains = new Array(total);

  for (var index = 0; index < total; index++) {
    gains[index] = audioCtx.createGain();
    filters[index] = audioCtx.createBiquadFilter();
    filters[index].connect(gains[index]);
    oscillators[index] = audioCtx.createOscillator();
    oscillators[index].connect(filters[index]);
  }

  function rewireNoRingMod() {
    for (var _index = 0; _index < total; _index++) {
      gains[_index].connect(audioCtx.destination);

      gains[_index].gain.value = 1;
    }
  }

  function rewireHorizontalRingMod(enable) {
    for (var y = 0; y < rows; y++) {
      for (var x = 1; x < columns; x++) {
        var thisGain = gains[asIndex(y, x)];
        var previousGain = gains[asIndex(y, x - 1)];
        previousGain.disconnect(enable ? audioCtx.destination : thisGain.gain);
        previousGain.connect(enable ? thisGain.gain : audioCtx.destination);
      }
    }
  }

  function rewireVerticalRingMod(enable) {
    for (var x = 0; x < columns; x++) {
      for (var y = 1; y < rows; y++) {
        var thisGain = gains[asIndex(y, x)];
        var previousGain = gains[asIndex(y - 1, x)];
        previousGain.disconnect(enable ? audioCtx.destination : thisGain.gain);
        previousGain.connect(enable ? thisGain.gain : audioCtx.destination);
      }
    }
  }

  function start() {
    oscillators.forEach(function (oscillator) {
      oscillator.start();
    });
  }

  var currentRingMod = rewireNoRingMod;
  currentRingMod(true);
  model.listen(function (_ref) {
    var field = _ref.field,
        value = _ref.value;

    if (field === "oscillatorType") {
      oscillators.forEach(function (o) {
        o.type = value;
      });
    } else if (field === "filterType") {
      filters.forEach(function (f) {
        f.type = value;
      });
    } else if (field === "ringMod") {
      currentRingMod(false);

      if (value === "off") {
        currentRingMod = rewireNoRingMod;
      } else if (value === "horizontal") {
        currentRingMod = rewireHorizontalRingMod;
      } else if (value === "vertical") {
        currentRingMod = rewireVerticalRingMod;
      }

      currentRingMod(true);
    }
  });
  return {
    audioCtx: audioCtx,
    oscillators: oscillators,
    filters: filters,
    gains: gains,
    start: start
  };
};

},{"./constants":8}],10:[function(require,module,exports){
"use strict";

var _require = require('./constants'),
    rows = _require.rows,
    columns = _require.columns,
    width = _require.width,
    height = _require.height;

var canvasContext = require("./canvas-context");

module.exports = function fillBox(targetSelector) {
  var targetCtx = canvasContext(targetSelector);
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

},{"./canvas-context":2,"./constants":8}],11:[function(require,module,exports){
"use strict";

var _require = require('./constants'),
    rows = _require.rows,
    columns = _require.columns,
    width = _require.width,
    height = _require.height;

var canvasContext = require("./canvas-context");

module.exports = function getColours(sourceSelector, video) {
  var sourceCtx = canvasContext(sourceSelector);
  var boxWidth = width / columns;
  var boxHeight = height / rows;
  return function (collator) {
    sourceCtx.drawImage(video, 0, 0, width, height);
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

},{"./canvas-context":2,"./constants":8}],12:[function(require,module,exports){
"use strict";

var listeners = [];
var model = {};
/* sample model

collator: "avg" <-- done
connected: "off"
filterColour: "red" <-- done
​filterType: "allpass" <-- done
​oscillatorColour: "red" <-- done
​oscillatorType: "sine" <-- done
​pitchRow: "off"
​resonanceColour: "red" <-- done
​ringMod: "off" <-- done;
​*/

module.exports = {
  register: function register(field) {
    Object.defineProperty(wrapper, field, {
      set: function set(value) {
        model[field] = value;
        listeners.forEach(function (l) {
          return l({
            field: field,
            value: value
          });
        });
      },
      get: function get() {
        return model[field];
      }
    });
  },
  listen: function listen(listener) {
    listeners.push(listener);
  }
};

},{}],13:[function(require,module,exports){
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

module.exports = function (audioGraph, model) {
  var audioCtx = audioGraph.audioCtx,
      oscillators = audioGraph.oscillators,
      filters = audioGraph.filters;

  function updateColours(colours) {
    colours.forEach(function (colour, index) {
      var x = index % 3;
      var y = Math.floor(index / 3);
      oscillators[index].frequency.setTargetAtTime(oscFreq(colour[model.oscillatorColour], x), audioCtx.currentTime, 0.1);
      filters[index].frequency.setTargetAtTime(cutoffFreq(colour[model.filterColour]), audioCtx.currentTime, 0.1);
      filters[index].Q.setTargetAtTime(q(colour[model.resonanceColour]), audioCtx.currentTime, 0.1);
    });
  } // TODO model.connected && model.pitchRow


  return {
    updateColours: updateColours
  };
};

},{}]},{},[1]);
