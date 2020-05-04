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
