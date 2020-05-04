module.exports = function connectListeners(opts) {
  function filterTypeChange(evt) {
    opts.filter = evt.target.value;
  }

  function oscillatorTypeChange(evt) {
    opts.waveform = evt.target.value;
  }

  const oscillatorTypeRadios = document.querySelectorAll(
    'input[name="oscillatorType"]'
  );
  for (let i = 0; i < oscillatorTypeRadios.length; i++) {
    oscillatorTypeRadios[i].onclick = oscillatorTypeChange;
  }
  oscillatorTypeRadios[0].click();

  const filterTypeRadios = document.querySelectorAll(
    'input[name="filterType"]'
  );
  for (let i = 0; i < filterTypeRadios.length; i++) {
    filterTypeRadios[i].onclick = filterTypeChange;
  }
  filterTypeRadios[0].click();
};
