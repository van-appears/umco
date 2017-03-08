# umco
UserMedia Controlled Oscillations (i.e. browser-based webcam-driven synth)

### Running
Checkout the code then open src/index.html in Firefox (>50) or Chrome. Once running this will ask for permissions to use your webcam and the synth will start once this is granted.

The default synth has two oscillator nodes, each connected to a filter node, and then ring modulated together.

The application will display four areas when started:
* (top left) The image from the webcam
* (top right) A number of boxes, mapped from the image - one for each node. Clicking one of these will show the settings for that node
* (bottom left) Collator control; whether the box colour for an image block should be calculated from the average colour, or the colour of the centre pixel
* (bottom right) Settings for the selected node

Clicking an oscillator node shows the following settings
* Waveform shape - square, sine, sawtooth, triangle
* Frequency control - the attribute of the collated colour to map to the frequency
* Frequency from, to - the range for the oscillator

Clicking a filter node shows the following settings
* Filter type - allpass, bandpass, highpass, highshelf, lowpass, lowshelf, notch, peaking
* Frequency control - the controlling frequency for the filter
* Frequency from, to - the range for frequency
* Q - quality factor
Descriptions of what these filter types and settings do can be found here: https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode

### Alteration
If you want to alter the audio graph just edit the src/application.js `setupAudio` method. At the moment there are two methods `createOscillator` and `createFilter` you can call in there to create nodes, though you will need to connect the graph yourself - and for oscillator nodes, add a call to  start it into the returned `start` function. The rest of the code will update the number of boxes that needed to be collected from the webcam image.
