const listeners = [];
const model = {
  store(field, value) {
    this.field = value;
    listeners.forEach(l => l({ field, value }));
  },
  listen(listener) {
    listeners.push(listener);
  }
};

module.exports = model;
