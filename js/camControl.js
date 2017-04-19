function camControl( opts ) {
    var height = opts.height;
    var width = opts.width;

    function getCanvasContext( selector ) {
        var canvas = document.querySelector( selector );
        canvas.width = width;
        canvas.height = height;
        return canvas.getContext( "2d" );
    }

    var selectors = opts.selectors;
    var video = document.querySelector( selectors.video );
    var sourceCtx = getCanvasContext( selectors.source );
    var targetCtx = getCanvasContext( selectors.target );
    var targetCanvas = document.querySelector( selectors.target );
    var targetOffsetLeft = targetCanvas.offsetLeft;
    var targetOffsetTop = targetCanvas.offsetTop;
    var boxHeight = height / opts.rows;
    var boxWidth = width / opts.columns;
    var onChange = opts.onChange || function() {};
    var onHighlight = opts.onHighlight || function() {};
    var collator = opts.collator || function() {};
    var columns = opts.columns || 1;
    var rows = opts.rows || 1;
    var highlightX = 0;
    var highlightY = 0;

    targetCanvas.onclick = function( evt ) {
        var clickX = evt.pageX - targetOffsetLeft;
        var clickY = evt.pageY - targetOffsetTop;
        highlightX = Math.floor( clickX / boxWidth );
        highlightY = Math.floor( clickY / boxHeight );
        onHighlight( highlightX + ( columns * highlightY ) );
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

    function start( interval ) {
        if ( this.running ) { return; }
        this.running = setInterval( function() {
            sourceCtx.drawImage( video, 0, 0, width, height );
            onChange( getColours() );
        }, interval );
    }

    function stop() {
        clearInterval( this.running );
        delete this.running;
    }

    video.srcObject = opts.mediaStream;
    video.onloadedmetadata = function() {
        video.play();
        video.muted = true;
    };
    onHighlight( 0 );

    return {
        setCollator: setCollator,
        start: start,
        stop: stop
    };
};
