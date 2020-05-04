module.exports = function getColours(sourceCtx, opts) {
  const { rows, columns, width, height } = opts;
  const boxWidth = width / columns;
  const boxHeight = height / rows;

  return collator => {
    const boxColours = new Array(rows * columns);
    for (let boxY = 0; boxY < rows; boxY++) {
      for (let boxX = 0; boxX < columns; boxX++) {
        const startX = boxX * boxWidth;
        const startY = boxY * boxHeight;
        const data = sourceCtx.getImageData(
          startX,
          startY,
          boxWidth,
          boxHeight
        );
        const collatedColour = collator(data);
        boxColours[rows * boxY + boxX] = collatedColour;
      }
    }
    return boxColours;
  };
};
