const { rows, columns, asIndex } = require("./constants");

module.exports = function createAudioGraph(model) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const total = rows * columns;

  const oscillators = new Array(total);
  const filters = new Array(total);
  const gains = new Array(total);
  for (let index = 0; index < total; index++) {
    gains[index] = audioCtx.createGain();
    filters[index] = audioCtx.createBiquadFilter();
    filters[index].connect(gains[index]);
    oscillators[index] = audioCtx.createOscillator();
    oscillators[index].connect(filters[index]);
  }

  function rewireNoRingMod() {
    for (let index = 0; index < total; index++) {
      gains[index].connect(audioCtx.destination);
      gains[index].gain.value = 1;
    }
  }

  function rewireHorizontalRingMod(enable) {
    for (let y = 0; y < rows; y++) {
      for (let x = 1; x < columns; x++) {
        const thisGain = gains[asIndex(y, x)];
        const previousGain = gains[asIndex(y, x - 1)];
        previousGain.disconnect(enable ? audioCtx.destination : thisGain.gain);
        previousGain.connect(enable ? thisGain.gain : audioCtx.destination);
      }
    }
  }

  function rewireVerticalRingMod(enable) {
    for (let x = 0; x < columns; x++) {
      for (let y = 1; y < rows; y++) {
        const thisGain = gains[asIndex(y, x)];
        const previousGain = gains[asIndex(y - 1, x)];
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

  let currentRingMod = rewireNoRingMod;
  currentRingMod(true);

  model.listen(({ field, value }) => {
    if (field === "oscillatorType") {
      oscillators.forEach(o => {
        o.type = value;
      });
    } else if (field === "filterType") {
      filters.forEach(f => {
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
    audioCtx,
    oscillators,
    filters,
    gains,
    start
  };
};
