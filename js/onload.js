window.onload = function() {
    var CANVAS_WIDTH = 300;
    var CANVAS_HEIGHT = 240;
    var MEDIA_CONSTRAINTS = {
        audio: false,
        video: {
            width: {
                ideal: CANVAS_WIDTH
            },
            height: {
                ideal: CANVAS_HEIGHT
            }
        }
    };
    var SELECTORS = {
        video: "#video",
        source: "#copy",
        target: "#render"
    };

    if ( navigator.mediaDevices ) {
        navigator.mediaDevices
            .getUserMedia( MEDIA_CONSTRAINTS )
            .then( function( mediaStream ) {
                var app = application( mediaStream );
                var nodes = app.getControllableNodeCount();
                var rows = Math.ceil( Math.sqrt( nodes ) );
                var columns = Math.ceil( nodes / rows );

                var opts = {
                    rows: rows,
                    columns: columns,
                    mediaStream: mediaStream,
                    width: CANVAS_WIDTH,
                    height: CANVAS_HEIGHT,
                    selectors: SELECTORS,
                    onChange: app.onChange,
                    onHighlight: app.onHighlight
                }
                var controller = camControl( opts );
                app.setController( controller );
            } )
            .catch( function( err ) {
                console.log( err );
            } );
    } else {
        alert( "navigator.mediaDevices not supported" );
    }
}