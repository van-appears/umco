function application() {
    var updaters = [];
    var audioCtx = new ( window.AudioContext || window.webkitAudioContext )();

    function getColourControlledValue( colourObj, colourStr ) {
        switch ( colourStr ) {
            case "red": return colourObj.r / 255.0;
            case "red_inv": return 1.0 - ( colourObj.r / 255.0 );
            case "green": return colourObj.g / 255.0;
            case "green_inv": return 1.0 - ( colourObj.g / 255.0 );
            case "blue": return colourObj.b / 255.0;
            case "blue_inv": return 1.0 - ( colourObj.b / 255.0 );
        }
        return 0;
    }

    function createOscillatorUpdater( node, values ) {
        return function( colour ) {
            var scale = getColourControlledValue( colour, values.freqControl );
            var from = parseFloat( values.freqFrom ) || 1;
            var to = parseFloat( values.freqTo ) || 1;
            var freq = from * Math.pow( to / from, scale );

            if ( node.type !== values.type ) { node.type = values.type; }
            node.frequency.setTargetAtTime(
                freq, audioCtx.currentTime, 0.1 );
        };
    }

    function createFilterUpdater( node, values ) {
        return function( colour ) {
            var q = getColourControlledValue( colour, values.q );
            var scale = getColourControlledValue( colour, values.freqControl );
            var from = parseFloat( values.freqFrom ) || 1;
            var to = parseFloat( values.freqTo ) || 1;
            var freq = from * Math.pow( to / from, scale );

            if ( node.type !== values.type ) { node.type = values.type; }
            node.frequency.setTargetAtTime(
                freq, audioCtx.currentTime, 0.1 );
            node.Q.setTargetAtTime( q, audioCtx.currentTime, 0.1 );
            node.gain.setTargetAtTime( q, audioCtx.currentTime, 0.1 );
        };
    }

    function createWaveformTypeControlHTML( fieldset, waveform ) {
        var field = document.createElement( "div" );
        fieldset.appendChild( field );
        var options = "";
        [ "sawtooth", "sine", "square", "triangle" ].forEach( function( x ) {
            var attr = x === waveform ? " selected" : "";
            options += "<option value='" + x + "'" + attr + ">" +
                x.slice( 0, 1 ).toUpperCase() + x.slice( 1 ) +
            "</option>";
        } );
        field.innerHTML = "" +
            "<label>Waveform shape" +
                "<select name='type'>" + options + "</select>" +
            "</label>";
    }

    function createFilterTypeControlHTML( fieldset ) {
        var field = document.createElement( "div" );
        fieldset.appendChild( field );
        field.innerHTML = "" +
            "<label>Filter type" +
                "<select name='type'>" +
                    "<option value='bandpass'>Bandpass</option>" +
                    "<option value='highpass' selected>Highpass</option>" +
                    "<option value='highshelf'>Highshelf</option>" +
                    "<option value='lowpass' selected>Lowpass</option>" +
                    "<option value='lowshelf'>Lowshelf</option>" +
                    "<option value='notch'>Notch</option>" +
                "</select>" +
            "</label>";
    }

    function createColourOptions() {
        return "<option value='blue'>Blue</option>" +
            "<option value='blue_inv'>Blue inverted</option>" +
            "<option value='green' selected>Green</option>" +
            "<option value='green_inv'>Green inverted</option>" +
            "<option value='red'>Red</option>" +
            "<option value='red_inv'>Red inverted</option>";
    }

    function createFrequencyControlHTML( fieldset, from, to ) {
        var field = document.createElement( "div" );
        fieldset.appendChild( field );
        field.innerHTML = "" +
            "<label>" +
                "<span class='flabel'>Cutoff frequency</span>" +
                "<select name='freqControl'>" +
                    createColourOptions() +
                "</select>" +
            "</label>" +
            "<label>Frequency from" +
                "<input name='freqFrom' type='text' value='" + from + "'/>" +
            "</label>" +
            "<label>Frequency to" +
                "<input name='freqTo' type='text' value='" + to + "'/>" +
            "</label>";
    }

    function relabelFilterControls( fieldsetChangeEvt, fieldset ) {
        var target = fieldsetChangeEvt.target;
        var qlabel = "Eh?";
        var flabel = "Eh?";
        if ( target.name === "type" ) {
            var label = "Eh?";
            switch ( target.value ) {
                case "bandpass":
                case "notch":
                    flabel = "Center frequency";
                    qlabel = "Band width";
                    break;
                case "highpass":
                case "lowpass":
                    flabel = "Cutoff frequency";
                    qlabel = "Resonance";
                    break;
                case "highshelf":
                case "lowshelf":
                    flabel = "Limit frequency";
                    qlabel = "Boost";
                    break;
            }
            fieldset.querySelector( ".flabel" ).innerHTML = flabel;
            fieldset.querySelector( ".qlabel" ).innerHTML = qlabel;
        }
    }

    function createQControlHTML( fieldset ) {
        var field = document.createElement( "div" );
        fieldset.appendChild( field );
        field.innerHTML = "" +
            "<label>" +
                "<span class='qlabel'>Resonance</span>" +
                "<select name='qControl'>" +
                    createColourOptions() +
                "</select>" +
            "</label>";
    }

    function collect( fieldset, listener ) {
        var values = {};
        var inputs = fieldset.querySelectorAll( "input, select" );
        var inputArray = Array.prototype.slice.call( inputs );
        inputArray.forEach( function( input ) {
            values[ input.name ] = input.value;
        } );
        fieldset.onchange = function( evt ) {
            values[ evt.target.name ] = evt.target.value;
            if ( listener ) { listener( evt, fieldset ); }
        };
        return values;
    }

    function createControlFieldset( legend ) {
        var controlElement = document.querySelector( ".controls" );
        var fieldset = document.createElement( "fieldset" );
        controlElement.appendChild( fieldset );
        fieldset.innerHTML = "<legend>" + legend + "</legend>";
        return fieldset;
    }

    function createOscillator( from, to, waveform ) {
        var node = audioCtx.createOscillator();
        var fieldset = createControlFieldset( "Oscillator" );
        createWaveformTypeControlHTML( fieldset, waveform );
        createFrequencyControlHTML( fieldset, from, to );
        updaters.push( createOscillatorUpdater( node, collect( fieldset ) ) );
        return node;
    }

    function createFilter( from, to ) {
        var node = audioCtx.createBiquadFilter();
        var fieldset = createControlFieldset( "Filter" );
        createFilterTypeControlHTML( fieldset );
        createFrequencyControlHTML( fieldset, from, to );
        createQControlHTML( fieldset );
        updaters.push( createFilterUpdater( node, collect( fieldset, relabelFilterControls ) ) );
        return node;
    }

    function setupAudio() {
        // create the controllable nodes. the order they are created determines
        // how they are laid out and what part of the image they relate to
        var osc1 = createOscillator( 55, 880, "triangle" );
        var filter1 = createFilter( 100, 20000 );
        var osc2 = createOscillator( 5.5, 88, "sawtooth" );
        var filter2 = createFilter( 100, 20000 );

        // build a graph
        var ringGain = audioCtx.createGain();
        osc1.connect( filter1 );
        osc2.connect( filter2 );
        filter1.connect( ringGain );
        filter2.connect( ringGain.gain );
        ringGain.connect( audioCtx.destination );

        // and begin
        osc1.start();
        osc2.start();
    }

    function avgColourCollator( data ) {
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

    function centreColourCollator( data ) {
        var dataPerPixel = 4;
        var length = data.data.length;
        var i = Math.floor( ( length / dataPerPixel ) / 2 ) * dataPerPixel;
        return {
            r: data.data[ i ],
            g: data.data[ i + 1 ],
            b: data.data[ i + 2 ]
        };
    }

    function onChange( colours ) {
        updaters.forEach( function( updater, index ) {
            updater( colours[ index ] );
        } );
    }

    function onHighlight( boxIndex ) {
        var boxSelector =
            ".controls fieldset:nth-of-type(" + ( boxIndex + 3 ) + ")";
        var display = document.querySelector( boxSelector );
        if ( !display ) { display = document.querySelector( ".blank" ); }
        var current = document.querySelector( ".controls fieldset.visible" );
        if ( display !== current ) {
            if ( current ) { current.classList.remove( "visible" ); }
            display.classList.add( "visible" );
        }
    }

    function setController( controller ) {
        controller.setCollator( avgColourCollator );
        document.querySelector( "#box_colour" ).onchange = function( evt ) {
            if ( evt.target.value === "average" ) {
                controller.setCollator( avgColourCollator );
            } else {
                controller.setCollator( centreColourCollator );
            }
        };
        controller.start( 1000 / 25 );
    }

    var graphControl = setupAudio();
    return {
        getControllableNodeCount: function() {
            return updaters.length;
        },
        onChange: onChange,
        onHighlight: onHighlight,
        setController: setController
    };
};
