class UnhandledArraySizeError extends Error {
  constructor (message) {
    super(message ? message : 'More than 100 items returned');
    this.name = 'UnhandledArraySizeError';
  }
}

module.exports = UnhandledArraySizeError;
