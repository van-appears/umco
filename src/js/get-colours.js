const { rows, columns, total, width, height, asIndex } = require("./constants");
const canvasContext = require("./canvas-context");
const colorsys = require("colorsys");

module.exports = function getColours(sourceSelector, video) {
  const sourceCtx = canvasContext(sourceSelector);
  const boxWidth = width / columns;
  const boxHeight = height / rows;

  return collator => {
    sourceCtx.drawImage(video, 0, 0, width, height);
    const boxColours = new Array(total);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const startX = col * boxWidth;
        const startY = row * boxHeight;
        const data = sourceCtx.getImageData(
          startX,
          startY,
          boxWidth,
          boxHeight
        );
        const collatedColour = collator(data);
        const { r, g, b } = collatedColour;
        const { h, s, v } = colorsys.rgbToHsv(collatedColour);

        boxColours[asIndex(row, col)] = {
          rgb: `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`,
          r: r / 255,
          g: g / 255,
          b: b / 255,
          h: h / 360,
          s: s / 100,
          v: v / 100
        };
      }
    }
    return boxColours;
  };
};
