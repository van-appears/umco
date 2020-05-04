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

module.exports = function (audioGraph) {
  const { audioCtx, oscillators, filters } = audioGraph;
  return (colours) => {
    colours.forEach((colour, index) => {
      const { r, g, b } = colour;
      const x = index % 3;
      const y = Math.floor(index / 3);

      oscillators[index].frequency.setTargetAtTime(
        oscFreq(r, x),
        audioCtx.currentTime,
        0.1
      );
      filters[index].frequency.setTargetAtTime(
        cutoffFreq(g),
        audioCtx.currentTime,
        0.1
      );
      filters[index].Q.setTargetAtTime(q(b), audioCtx.currentTime, 0.1);
    });
  };
};
