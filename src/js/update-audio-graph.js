const { rows, columns, asIndex, total, lowFreq } = require("./constants");

function scale(colour, scalar) {
  const scaled = colour / 256;
  return Math.pow(Math.pow(2.0, scalar), scaled);
}

function oscFreq(colour, row) {
  return (
    lowFreq * (row ? Math.pow(2, row) * scale(colour, 1) : scale(colour, rows))
  );
}

function cutoffFreq(colour) {
  //return 500 * scale(colour);
  return 500; // TODO
}

function q(colour) {
  //return 0.5 + colour / 512;
  return 1; // TODO
}

module.exports = function (audioGraph, model) {
  const { audioCtx, oscillators, filters } = audioGraph;
  // TODO model.pitchRow

  return colours => {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const index = asIndex(row, col);
        const colour = colours[index];
        let oscillatorFreq;

        if (model.connected === "on") {
          const centreIndex =
            model.pitchRow === "on"
              ? asIndex(row, Math.floor(columns / 2))
              : asIndex(Math.floor(row / 2), Math.floor(columns / 2));
          const relativeTo = oscFreq(
            colours[centreIndex][model.oscillatorColour],
            model.pitchRow === "on" ? row : null
          );
          oscillatorFreq = centreIndex === index
            ? relativeTo
            : relativeTo; // TODO...
        } else {
          oscillatorFreq = oscFreq(
            colour[model.oscillatorColour],
            model.pitchRow === "on" ? row : null
          );
        }

        oscillatorFreq = 100; // TODO

        oscillators[index].frequency.setTargetAtTime(
          oscillatorFreq,
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
      }
    }
  };
};
