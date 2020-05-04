module.exports = function fillBox(targetCtx, opts) {
  const { rows, columns, width, height } = opts;
  const boxWidth = width / columns;
  const boxHeight = height / rows;

  return boxColours => {
    for (let boxY=0; boxY<rows; boxY++) {
      for (let boxX=0; boxX<columns; boxX++) {
        var startX = boxX * boxWidth;
        var startY = boxY * boxHeight;
        var colour = boxColours[rows * boxY + boxX];

        var r = Math.floor( colour.r );
        var g = Math.floor( colour.g );
        var b = Math.floor( colour.b );
        targetCtx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        targetCtx.fillRect( startX, startY, boxWidth, boxHeight );
        targetCtx.fill();
      }
    }
  };
};
