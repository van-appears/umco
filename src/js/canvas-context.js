const { width, height } = require("./constants");

module.exports = function (selector) {
  const canvas = document.querySelector(selector);
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext("2d");
};
