const { rows, columns } = require("./constants");

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
  return 0.5 + colour / 512;
}

module.exports = function (audioGraph, model) {
  const { audioCtx, oscillators, filters } = audioGraph;

  function updateColours(colours) {
    const centreIndex = Math.floor(colours / 2);
    const centreFreq =
      model.connected === "on"
        ? oscFreq(colours[centreIndex][model.oscillatorColour], 1)
        : 0;

    colours.forEach((colour, index) => {
      const x = index % 3;
      const y = Math.floor(index / 3);

      oscillators[index].frequency.setTargetAtTime(
        oscFreq(colour[model.oscillatorColour], x),
        audioCtx.currentTime,
        0.1
      );
      filters[index].frequency.setTargetAtTime(
        cutoffFreq(colour[model.filterColour]),
        audioCtx.currentTime,
        0.1
      );
      filters[index].Q.setTargetAtTime(
        q(colour[model.resonanceColour]),
        audioCtx.currentTime,
        0.1
      );
    });
  }

  // TODO model.connected && model.pitchRow

  return {
    updateColours
  };
};
