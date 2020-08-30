const { rows, columns, total, width, height, asIndex } = require("./constants");
const canvasContext = require("./canvas-context");

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
        boxColours[asIndex(row, col)] = collatedColour;
      }
    }
    return boxColours;
  };
};
