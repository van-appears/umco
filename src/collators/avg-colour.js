module.exports =  function avgColourCollator( data ) {
    var dataPerPixel = 4;
    var length = data.data.length;
    var pixels = length / dataPerPixel;
    var i = 0, r = 0, g = 0, b = 0;
    while ( i < length ) {
        r += data.data[ i ];
        g += data.data[ i + 1 ];
        b += data.data[ i + 2 ];
        i += dataPerPixel;
    }
    return { r: r / pixels, g: g / pixels, b: b / pixels };
}
