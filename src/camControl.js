window.camControl = function( opts, callback ) {
    var WIDTH = 300;
    var HEIGHT = 240;
    var MEDIA_CONSTRAINTS = {
        audio: false,
        video: {
            width: {
                ideal: WIDTH
            },
            height: {
                ideal: HEIGHT
            }
        }
    };

    function getCanvasContext( selector ) {
        var canvas = document.querySelector( selector );
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        return canvas.getContext( "2d" );
    }

    var selectors = opts.selectors,
        columns = opts.columns || 1,
        rows = opts.rows || 1,
        onChange = opts.onChange || function() {},
        onHighlight = opts.onHighlight || function() {},
        collator = opts.collator || function() {},
        interval = opts.interval || 1,

        video = document.querySelector( selectors.video ),
        sourceCtx = getCanvasContext( selectors.source ),
        targetCtx = getCanvasContext( selectors.target ),
        targetCanvas = document.querySelector( selectors.target ),
        targetOffsetLeft = targetCanvas.offsetLeft,
        targetOffsetTop = targetCanvas.offsetTop,
        boxHeight = HEIGHT / opts.rows,
        boxWidth = WIDTH / columns,
        highlightX = 0,
        highlightY = 0;

    targetCanvas.onclick = function( evt ) {
        var clickX = evt.pageX - targetOffsetLeft;
        var clickY = evt.pageY - targetOffsetTop;
        highlightX = Math.floor( clickX / boxWidth );
        highlightY = Math.floor( clickY / boxHeight );
        onHighlight( highlightX + ( rows * highlightY ) );
    };

    function highlightBox( startX, startY ) {
        targetCtx.strokeStyle = "#000000";
        targetCtx.strokeRect(
            startX + 1, startY + 1, boxWidth - 2, boxHeight - 2 );
        targetCtx.strokeStyle = "#FFFFFF";
        targetCtx.strokeRect(
            startX + 2, startY + 2, boxWidth - 4, boxHeight - 4 );
    }

    function fillBox( startX, startY, colour ) {
        var r = Math.floor( colour.r );
        var g = Math.floor( colour.g );
        var b = Math.floor( colour.b );
        targetCtx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        targetCtx.fillRect( startX, startY, boxWidth, boxHeight );
        targetCtx.fill();
    }

    function getColours() {
        var boxColours = [];
        for ( var boxY = 0; boxY < rows; boxY++ ) {
            for ( var boxX = 0; boxX < columns; boxX++ ) {
                var startX = boxX * boxWidth;
                var startY = boxY * boxHeight;
                var data = sourceCtx.getImageData(
                    startX, startY, boxWidth, boxHeight );
                var collatedColour = collator( data );
                boxColours.push( collatedColour );

                fillBox( startX, startY, collatedColour );
                if ( boxX === highlightX && boxY === highlightY ) {
                    highlightBox( startX, startY );
                }
            }
        }
        return boxColours;
    }

    function setCollator( useCollator ) {
        collator = useCollator;
    }

    function start() {
        if ( this.running ) { return; }
        this.running = setInterval( function() {
            sourceCtx.drawImage( video, 0, 0, WIDTH, HEIGHT );
            onChange( getColours() );
        }, interval );
    }

    function stop() {
        clearInterval( this.running );
        delete this.running;
    }

    navigator.mediaDevices
        .getUserMedia( MEDIA_CONSTRAINTS )
        .then( function( mediaStream ) {
            video.onloadedmetadata = function() {
                video.play();
            };
            video.srcObject = mediaStream;
            callback( null, {
                setCollator: setCollator,
                start: start,
                stop: stop
            } );
            onHighlight( 0 );
        } )
        .catch( function( err ) {
            callback( err );
        } );
};
