module.exports = function(selector, opts) {
  const {width, height} = opts;
  var canvas = document.querySelector( selector );
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext( "2d" );
}