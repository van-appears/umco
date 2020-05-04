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