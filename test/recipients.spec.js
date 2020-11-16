const SLACK_ERROR_LOG = 'https://example.com';
const TUTORCRUNCHER_API_URL = 'https://secure.tutorcruncher.com/api';
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const nock = require('nock');
const RecipientUtilities = require('../lib/RecipientUtilities');
const TutorCruncherIntegrationError = require('../lib/errors/TutorCruncherIntegrationError');
const UnhandledArraySizeError = require('../lib/errors/UnhandledArraySizeError');

describe('Recipient Utilities Test', () => {
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
    const tCRecUtil = new RecipientUtilities();
    expect(tCRecUtil).to.be.instanceOf(RecipientUtilities);
    expect(() => {
      tCRecUtil.throwError('Message')
    }).to.throw(TutorCruncherIntegrationError);
  });

  it('should create an instance of a RecipientUtilities', () => {
    const tCRecUtil = new RecipientUtilities('12345');
    expect(tCRecUtil).to.be.instanceOf(RecipientUtilities);
  });

  it('should get from TutorCruncher', async () => {
    nock(TUTORCRUNCHER_API_URL)
        .get(uri => uri.includes('recipients'))
        .reply(200, { response: "tc-response" });

    const tCRecUtil = new RecipientUtilities('12345');
    const response = await tCRecUtil.getRecipient(1);
    expect(response.response).to.equal('tc-response');
  });

  it('should get student from TutorCruncher', async () => {
    nock(TUTORCRUNCHER_API_URL)
        .get(uri => uri.includes('recipients'))
        .reply(200, { response: "tc-response" });

    const tCRecUtil = new RecipientUtilities('12345');
    const response = await tCRecUtil.getStudent(1);
    expect(response.response).to.equal('tc-response');
  });

  it('create in TutorCruncher', async () => {
    nock(TUTORCRUNCHER_API_URL)
        .post(uri => uri.includes('recipients'))
        .reply(200, { response: "tc-response" });

    const tCRecUtil = new RecipientUtilities('12345');
    const response = await tCRecUtil.createRecipient({ email: 'tim@tim.com'});
    expect(response.response).to.equal('tc-response');
  });

  it('create student in TutorCruncher', async () => {
    nock(TUTORCRUNCHER_API_URL)
        .post(uri => uri.includes('recipients'))
        .reply(200, { response: "tc-response" });

    const tCRecUtil = new RecipientUtilities('12345');

    const response = await tCRecUtil.createStudent({ email: 'tim@tim.com'});
    expect(response.response).to.equal('tc-response');
  });

  it('update in TutorCruncher', async () => {
    nock(TUTORCRUNCHER_API_URL)
        .post(uri => uri.includes('recipients'))
        .reply(200, { response: "tc-response" });

    const tCRecUtil = new RecipientUtilities('12345');

    const response = await tCRecUtil.updateRecipient({ email: 'tim@tim.com'});
    expect(response.response).to.equal('tc-response');
  });

  it('update student in TutorCruncher', async () => {
    nock(TUTORCRUNCHER_API_URL)
        .post(uri => uri.includes('recipients'))
        .reply(200, { response: "tc-response" });

    const tCRecUtil = new RecipientUtilities('12345');

    const response = await tCRecUtil.updateStudent({ email: 'tim@tim.com'});
    expect(response.response).to.equal('tc-response');
  });

  it('should get all from TutorCruncher', async () => {
    nock(TUTORCRUNCHER_API_URL)
        .get(uri => uri.includes('recipients'))
        .reply(200, { results: [ {id: 1}, {id: 2}, {id: 3} ] });

    const tCRecUtil = new RecipientUtilities('12345');
    const response = await tCRecUtil.getAllRecipients();
    expect(response).to.deep.equal([ {id: 1}, {id: 2}, {id: 3} ]);
  });

  it('should get the academic year index', async () => {
    const tCRecUtil = new RecipientUtilities('12345');
    const response = await tCRecUtil.getAcademicYearIndex('Reception');
    expect(response).to.equal(0);

    const response2 = await tCRecUtil.getAcademicYearIndex('Year 13');
    expect(response2).to.equal(13);

    const response3 = await tCRecUtil.getAcademicYearIndex('18+ Adult');
    expect(response3).to.equal(null);
  });

});
