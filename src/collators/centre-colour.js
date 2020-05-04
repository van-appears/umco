module.exports = function centreColourCollator(data) {
  const dataPerPixel = 4;
  const length = data.data.length;
  const i = Math.floor(length / dataPerPixel / 2) * dataPerPixel;
  return {
    r: data.data[i],
    g: data.data[i + 1],
    b: data.data[i + 2],
  };
};
