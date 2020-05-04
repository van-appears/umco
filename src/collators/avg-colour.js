module.exports = function avgColourCollator(data) {
  const dataPerPixel = 4;
  const length = data.data.length;
  const pixels = length / dataPerPixel;
  let i = 0,
    r = 0,
    g = 0,
    b = 0;
  while (i < length) {
    r += data.data[i];
    g += data.data[i + 1];
    b += data.data[i + 2];
    i += dataPerPixel;
  }
  return { r: r / pixels, g: g / pixels, b: b / pixels };
};
