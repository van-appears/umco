module.exports = centreColourCollator( data ) {
    var dataPerPixel = 4;
    var length = data.data.length;
    var i = Math.floor( ( length / dataPerPixel ) / 2 ) * dataPerPixel;
    return {
        r: data.data[ i ],
        g: data.data[ i + 1 ],
        b: data.data[ i + 2 ]
    };
}