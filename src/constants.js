const rows = 3;
const columns = 3;
const total = rows * columns;

module.exports = {
  rows,
  columns,
  total,
  width: 300,
  height: 300,
  asIndex(row, col) {
    return row * columns + col;
  },
  asRowCol(index) {
    return {
      row: Math.floor(index / columns),
      col: index % columns
    };
  }
};
