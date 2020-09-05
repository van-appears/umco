const { rows, columns, width, height, asIndex } = require("./constants");
const canvasContext = require("./canvas-context");

module.exports = function fillBox(targetSelector) {
  const targetCtx = canvasContext(targetSelector);
  const boxWidth = width / columns;
  const boxHeight = height / rows;

  return boxColours => {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const startX = col * boxWidth;
        const startY = row * boxHeight;
        const colour = boxColours[asIndex(row, col)];

        const { rgb } = colour;
        targetCtx.fillStyle = rgb;
        targetCtx.fillRect(startX, startY, boxWidth, boxHeight);
        targetCtx.fill();
      }
    }
  };
};
