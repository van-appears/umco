const model = require("./model");

function connectRadioValue(radioName) {
  const radios = document.querySelectorAll(`input[name="${radioName}"]`);
  const radioValue = function (evt) {
    model.store(radioName, evt.target.value);
  };
  for (let i = 0; i < radios.length; i++) {
    radios[i].onclick = radioValue;
  }
  radios[0].click();
}

function connectRotatingValue(buttonId, items) {
  const element = document.querySelector("#" + buttonId);
  let index = items.findIndex(x => x === element.value) - 1;
  const rotatingValue = function () {
    index = (index + 1) % items.length;
    model.store(buttonId, items[index]);
    element.value = items[index];
  };
  element.onclick = rotatingValue;
  element.click();
}

module.exports = function connectListeners() {
  connectRadioValue("oscillatorType");
  connectRadioValue("filterType");

  const colourOrder = ["r", "g", "b"];
  connectRotatingValue("oscillatorColour", colourOrder);
  connectRotatingValue("filterColour", colourOrder);
  connectRotatingValue("resonanceColour", colourOrder);

  const collatorOrder = ["avg", "centre"];
  connectRotatingValue("collator", collatorOrder);

  const ringModOrder = ["off", "horizontal", "vertical"];
  connectRotatingValue("ringMod", ringModOrder);

  const offOn = ["off", "on"];
  connectRotatingValue("pitchRow", offOn);
  connectRotatingValue("connected", offOn);

  return model;
};
