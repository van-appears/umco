# umco
UserMedia Controlled Oscillations (look, bascially a browser-based webcam-driven synth)

# components
The centre of the screen shows 9 boxes, derived from the image captured via your webcam. Each of these boxes controls a separate oscillator. The colours of the boxes are based on the collator chosen (see below)

The three rows of buttons are for controlling the output
## first row
* The colour attribute that controls the oscillator frequency
  * Clicking this button rotates through the six attributes: red, green, blue, hue, saturation, or value
* Oscillator waveform: sine, sawtooth, triangle, or square

## second row
* The colour attribute the controls the filter cutoff frequency
* The filter type: all pass (i.e. no filter), low pass, high pass, or band pass
* The colour attribute that controlls the filter resonance / bandwidth

## third row
* Ring mod
  * Clicking this button rotates through three options: off, ring mod the oscillators in a row, or ring mod the oscillators in a column
* Colour collator
  * Clicking this button rotates through two options: the average colour of the box in the captured webcam image, or the centre pixel of the box in the captured webcam image.
* Pitch row
  * Clicking this button rotates through two options: each oscillator can cover three octaves, or each row represents a different octave
* Connected oscillators
  * Clicking this button rotates through two options: each oscillator ranges freely, or only the centre oscillator ranges freely and the surrounding oscillator frequencies are fine adjustments to that. Note this only affects the frequency, not the filter cutoff.
  * If the pitch row is also enabled, then the centre of each row is used instead.

# development
To run development mode
```
npm start
```
To create a production build
```
export NODE_ENV=production
npm run build
```
