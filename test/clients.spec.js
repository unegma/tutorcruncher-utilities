const SLACK_ERROR_LOG = 'https://example.com';
const TUTORCRUNCHER_API_URL = 'https://secure.tutorcruncher.com/api';
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const nock = require('nock');
const ClientUtilities = require('../lib/ClientUtilities');
const TutorCruncherIntegrationError = require('../lib/errors/TutorCruncherIntegrationError');
const UnhandledArraySizeError = require('../lib/errors/UnhandledArraySizeError');

describe('Client Utilities Test', () => {
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

  it('should create an instance of a Recipient Utilities and test correct error is thrown', () => {
    const tCClUtil = new ClientUtilities();
    expect(tCClUtil).to.be.instanceOf(ClientUtilities);
    expect(() => {
      tCClUtil.throwError('Message')
    }).to.throw(TutorCruncherIntegrationError);
  });

  it('should create an instance of a ClientUtilities', () => {
    const tCClUtil = new ClientUtilities('12345');
    expect(tCClUtil).to.be.instanceOf(ClientUtilities);
  });

  it('should get from TutorCruncher', async () => {
    nock(TUTORCRUNCHER_API_URL)
        .get(uri => uri.includes('clients'))
        .reply(200, { response: "tc-response" });

    const tCClUtil = new ClientUtilities('12345');
    const response = await tCClUtil.getClient(1);
    expect(response.response).to.equal('tc-response');
  });

  it('create in TutorCruncher', async () => {
    nock(TUTORCRUNCHER_API_URL)
        .post(uri => uri.includes('clients'))
        .reply(200, { response: "tc-response" });

    const tCClUtil = new ClientUtilities('12345');
    const response = await tCClUtil.createClient({ email: 'tim@tim.com'});
    expect(response.response).to.equal('tc-response');
  });

  it('update in TutorCruncher', async () => {
    nock(TUTORCRUNCHER_API_URL)
        .post(uri => uri.includes('clients'))
        .reply(200, { response: "tc-response" });

    const tCClUtil = new ClientUtilities('12345');

    const response = await tCClUtil.updateClient({ email: 'tim@tim.com'});
    expect(response.response).to.equal('tc-response');
  });

  it('should get all from TutorCruncher', async () => {
    nock(TUTORCRUNCHER_API_URL)
        .get(uri => uri.includes('clients'))
        .reply(200, { results: [ {id: 1}, {id: 2}, {id: 3} ] });

    const tCClUtil = new ClientUtilities('12345');
    const response = await tCClUtil.getAllClients();
    expect(response).to.deep.equal([ {id: 1}, {id: 2}, {id: 3} ]);
  });

});
