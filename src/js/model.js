const listeners = [];

module.exports = {
  store(field, value) {
    this.field = value;
    listeners.forEach(l => l({ field, value }));
  },
  listen(listener) {
    listeners.push(listener);
  }
};
