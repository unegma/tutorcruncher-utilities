const SLACK_ERROR_LOG = 'https://example.com';
const TUTORCRUNCHER_API_URL = 'https://secure.tutorcruncher.com/api';
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const nock = require('nock');
const BaseUtilities = require('../lib/BaseUtilities');
const TutorCruncherIntegrationError = require('../lib/errors/TutorCruncherIntegrationError');
const UnhandledArraySizeError = require('../lib/errors/UnhandledArraySizeError');

describe('Tutor Cruncher Utilities Test', () => {
  beforeEach(function() {
  });

  afterEach(function() {
  });

  it('should create an instance of an TutorCruncherIntegrationError', () => {
    const error = new TutorCruncherIntegrationError('Error');
    expect(error.message).to.equal('Error');
  });

  it('should create an instance of an UnhandledArraySizeError', () => {
    const error = new UnhandledArraySizeError('Error');
    expect(error.message).to.equal('Error');
  });

  it('should create an instance of a BaseUtilities and test correct error is thrown', () => {
    const baseUtilities = new BaseUtilities();
    expect(baseUtilities).to.be.instanceOf(BaseUtilities);
    expect(() => {
      baseUtilities.throwError('Message')
    }).to.throw(TutorCruncherIntegrationError);
  });

  it('should create an instance of a BaseUtilities', () => {
    const baseUtilities = new BaseUtilities('12345');
    expect(baseUtilities).to.be.instanceOf(BaseUtilities);

  });

  it('should get from TutorCruncher', async () => {
    nock(TUTORCRUNCHER_API_URL)
        .get(uri => uri.includes('example-path'))
        .reply(200, { response: "tc-response" });

    const baseUtilities = new BaseUtilities('12345');
    const response = await baseUtilities.getFromTC('/example-path/');
    expect(response.response).to.equal('tc-response');
  });

  it('should post to TutorCruncher', async () => {
    nock(TUTORCRUNCHER_API_URL)
        .post(uri => uri.includes('example-path'))
        .reply(200, { response: "tc-response" });

    const baseUtilities = new BaseUtilities('12345');
    const response = await baseUtilities.postToTC('/example-path/', { body: 'example' });
    expect(response.response).to.equal('tc-response');
  });

  it('should get all from TutorCruncher', async () => {
    nock(TUTORCRUNCHER_API_URL)
        .get(uri => uri.includes('lessons'))
        .reply(200, { results: [ {id: 1}, {id: 2}, {id: 3} ] });

    const baseUtilities = new BaseUtilities('12345');
    const response = await baseUtilities.getAllFromTutorCruncher('lessons');
    expect(response).to.deep.equal([ {id: 1}, {id: 2}, {id: 3} ]);
  });

  // todo add test for .next in url for get all from

});
