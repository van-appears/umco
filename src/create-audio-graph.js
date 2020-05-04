module.exports = function createAudioGraph(opts) {
  const { waveform, filter } = opts;
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillators = new Array(9);
  const filters = new Array(9);
  const gains = new Array(9);
  for (let index = 0; index < 9; index++) {
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
    audioCtx,
    oscillators,
    filters,
    gains,
    start
  };
};
