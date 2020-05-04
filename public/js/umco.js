(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var createAudioGraph = require('./create-audio-graph');
var connectCamera = require('./connect-camera');
var canvasContext = require('./canvas-context');
var getColoursFactory = require('./get-colours');
var fillBoxFactory = require('./fill-box');
var graphUpdaterFactory = require('./graph-updater');
var avgColourCollator = require('./collators/avg-colour');

const opts = {
  width: 300,
  height: 300,
  rows: 3,
  columns: 3
};

window.onload = function() {
  connectCamera(opts, function(err, video) {
    if (err) {
        // TODO
    } else {
      document.body.className = "started";
      var audioGraph = createAudioGraph();
      var sourceCtx = canvasContext("#copy", opts);
      var targetCtx = canvasContext("#target", opts);
      const getColours = getColoursFactory(sourceCtx, opts);
      const fillBox = fillBoxFactory(targetCtx, opts);
      const graphUpdater = graphUpdaterFactory(audioGraph);
      audioGraph.start();

      this.running = setInterval(function () {
        sourceCtx.drawImage( video, 0, 0, opts.width, opts.height );
        const colours = getColours(avgColourCollator);
        fillBox(colours);
        graphUpdater(colours);
      }, 40);
    }
  });
}
},{"./canvas-context":2,"./collators/avg-colour":3,"./connect-camera":4,"./create-audio-graph":5,"./fill-box":6,"./get-colours":7,"./graph-updater":8}],2:[function(require,module,exports){
module.exports = function(selector, opts) {
  const {width, height} = opts;
  var canvas = document.querySelector( selector );
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext( "2d" );
}
},{}],3:[function(require,module,exports){
module.exports =  function avgColourCollator( data ) {
    var dataPerPixel = 4;
    var length = data.data.length;
    var pixels = length / dataPerPixel;
    var i = 0, r = 0, g = 0, b = 0;
    while ( i < length ) {
        r += data.data[ i ];
        g += data.data[ i + 1 ];
        b += data.data[ i + 2 ];
        i += dataPerPixel;
    }
    return { r: r / pixels, g: g / pixels, b: b / pixels };
}

},{}],4:[function(require,module,exports){
module.exports = function connectCamera( opts, callback ) {
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

  if ( navigator.mediaDevices ) {
    navigator.mediaDevices
      .getUserMedia( MEDIA_CONSTRAINTS )
      .then( function( mediaStream ) {
          var video = document.querySelector("#video");
          video.srcObject = mediaStream;
          video.onloadedmetadata = function() {
            video.play();
            video.muted = true;
            callback(null, video);
          };
      } )
      .catch( function( err ) {
        callback( err );
      } );
    } else {
      callback(new Error("navigator.mediaDevices not supported" ));
    }
};

},{}],5:[function(require,module,exports){
module.exports = function createAudioGraph () {
  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  var oscillators = new Array(9);
  var filters = new Array(9);
  var gains = new Array(9);
  for (var index=0; index<9; index++) {
    oscillators[index] = audioCtx.createOscillator();
    oscillators[index].type = "square";
    filters[index] = audioCtx.createBiquadFilter();
    filters[index].type = "bandpass";
    gains[index] = audioCtx.createGain();

    oscillators[index].connect(filters[index]);
    filters[index].connect(gains[index]);
    gains[index].connect(audioCtx.destination);
  }

  function start() {
    oscillators.forEach(function(oscillator) {
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
}

},{}],6:[function(require,module,exports){
module.exports = function fillBox(targetCtx, opts) {
  const { rows, columns, width, height } = opts;
  const boxWidth = width / columns;
  const boxHeight = height / rows;

  return boxColours => {
    for (let boxY=0; boxY<rows; boxY++) {
      for (let boxX=0; boxX<columns; boxX++) {
        var startX = boxX * boxWidth;
        var startY = boxY * boxHeight;
        var colour = boxColours[rows * boxY + boxX];

        var r = Math.floor( colour.r );
        var g = Math.floor( colour.g );
        var b = Math.floor( colour.b );
        targetCtx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        targetCtx.fillRect( startX, startY, boxWidth, boxHeight );
        targetCtx.fill();
      }
    }
  };
};

},{}],7:[function(require,module,exports){
module.exports = function getColours(sourceCtx, opts) {
  const { rows, columns, width, height } = opts;
  const boxWidth = width / columns;
  const boxHeight = height / rows;

  return collator => {
    const boxColours = new Array(rows * columns);
    for (let boxY=0; boxY<rows; boxY++) {
      for (let boxX=0; boxX<columns; boxX++) {
        var startX = boxX * boxWidth;
        var startY = boxY * boxHeight;
        var data = sourceCtx.getImageData(
          startX, startY, boxWidth, boxHeight);
        var collatedColour = collator(data);
        boxColours[rows * boxY + boxX] = collatedColour;
      }
    }
    return boxColours;
  };
};

},{}],8:[function(require,module,exports){
function scale(colour) {
  const scaled = colour / 256;
  return Math.pow(2.0, scaled);
}

function oscFreq(colour, octave) {
  return 80 * Math.pow(2, octave) * scale(colour);
}

function cutoffFreq(colour) {
  return 500 * scale(colour);
}

function q(colour) {
  return 0.5 + (colour / 512);
}

module.exports = function(audioGraph) {
  const {audioCtx, oscillators, filters} = audioGraph;
  return colours => {
    colours.forEach((colour, index) => {
      const {r, g, b} = colour;
      const x = index % 3;
      const y = Math.floor(index / 3);

      oscillators[index].frequency.setTargetAtTime(
        oscFreq(r, x), audioCtx.currentTime, 0.1);
      filters[index].frequency.setTargetAtTime(
        cutoffFreq(g), audioCtx.currentTime, 0.1);
      filters[index].Q.setTargetAtTime(
        q(b), audioCtx.currentTime, 0.1);
    });
  };
};

},{}]},{},[1]);
