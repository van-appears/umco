const createAudioGraph = require("./create-audio-graph");
const connectCamera = require("./connect-camera");
const canvasContext = require("./canvas-context");
const getColoursFactory = require("./get-colours");
const fillBoxFactory = require("./fill-box");
const updateAudioGraphFactory = require("./update-audio-graph");
const avgColourCollator = require("./collators/avg-colour");

const opts = {
  width: 300,
  height: 300,
  rows: 3,
  columns: 3,
  waveform: "square",
  filter: "bandpass"
};

window.onload = function () {
  connectCamera(opts, function (err, video) {
    if (err) {
      // TODO
    } else {
      document.body.className = "started";
      const audioGraph = createAudioGraph(opts);
      const sourceCtx = canvasContext("#copy", opts);
      const targetCtx = canvasContext("#target", opts);
      const getColours = getColoursFactory(sourceCtx, opts);
      const fillBox = fillBoxFactory(targetCtx, opts);
      const updateAudioGraph = updateAudioGraphFactory(audioGraph, opts);
      audioGraph.start();

      this.running = setInterval(function () {
        sourceCtx.drawImage(video, 0, 0, opts.width, opts.height);
        const colours = getColours(avgColourCollator);
        fillBox(colours);
        updateAudioGraph(colours);
      }, 40);
    }
  });
};
