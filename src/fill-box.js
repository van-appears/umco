module.exports = function fillBox(targetCtx, opts) {
  const { rows, columns, width, height } = opts;
  const boxWidth = width / columns;
  const boxHeight = height / rows;

  return (boxColours) => {
    for (let boxY = 0; boxY < rows; boxY++) {
      for (let boxX = 0; boxX < columns; boxX++) {
        const startX = boxX * boxWidth;
        const startY = boxY * boxHeight;
        const colour = boxColours[rows * boxY + boxX];

        const { r, g, b } = colour;
        const rgb = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
        targetCtx.fillStyle = rgb;
        targetCtx.fillRect(startX, startY, boxWidth, boxHeight);
        targetCtx.fill();
      }
    }
  };
};
