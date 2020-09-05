const createAudioGraph = require("./create-audio-graph");
const connectCamera = require("./connect-camera");
const connectListeners = require("./connect-listeners");
const getColoursFactory = require("./get-colours");
const fillBoxFactory = require("./fill-box");
const updateAudioGraphFactory = require("./update-audio-graph");
const { avgColour, centreColour } = require("./collators");

window.onload = function () {
  connectCamera(function (err, video) {
    if (err) {
      document.querySelector(".info").innerHTML =
        "Failed to connect to camera: " + err.message;
    } else {
      document.body.className = "started";
      const model = connectListeners();
      const audioGraph = createAudioGraph(model);
      const getColours = getColoursFactory("#copy", video);
      const fillBox = fillBoxFactory("#target");
      const updateAudioGraph = updateAudioGraphFactory(audioGraph, model);

      // debug!!
      model.listen(x => {
        console.log("Model change", x);
      });

      audioGraph.start();

      setInterval(function () {
        const collator = model.collator === "centre" ? centreColour : avgColour;
        const colours = getColours(collator);
        fillBox(colours);
        updateAudioGraph(colours);
      }, 100);
    }
  });
};
