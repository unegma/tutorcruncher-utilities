class TutorCruncherIntegrationError extends Error {
  constructor (message) {
    super(message);
    this.name = 'TutorCruncherIntegrationError';
  }
}

module.exports = TutorCruncherIntegrationError;
