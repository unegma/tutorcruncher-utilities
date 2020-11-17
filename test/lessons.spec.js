const SLACK_ERROR_LOG = 'https://example.com';
const TUTORCRUNCHER_API_URL = 'https://secure.tutorcruncher.com/api';
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const nock = require('nock');
const LessonUtilities = require('../lib/LessonUtilities');
const TutorCruncherIntegrationError = require('../lib/errors/TutorCruncherIntegrationError');
const UnhandledArraySizeError = require('../lib/errors/UnhandledArraySizeError');

describe('Lesson Utilities Test', () => {
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

  it('should create an instance of a Lesson Utilities and test correct error is thrown', () => {
    const tCLessonsUtil = new LessonUtilities();
    expect(tCLessonsUtil).to.be.instanceOf(LessonUtilities);
    expect(() => {
      tCLessonsUtil.throwError('Message')
    }).to.throw(TutorCruncherIntegrationError);
  });

  it('should create an instance of a LessonUtilities', () => {
    const tCLessonsUtil = new LessonUtilities('12345');
    expect(tCLessonsUtil).to.be.instanceOf(LessonUtilities);
  });

  it('should get all lessons from TutorCruncher', async () => {
    nock(TUTORCRUNCHER_API_URL)
        .get(uri => uri.includes('appointments'))
        .reply(200, { results: "tc-response" });

    const tCLessonsUtil = new LessonUtilities('12345');
    const response = await tCLessonsUtil.getAllLessons();
    expect(response[0]).to.equal('tc-response');
  });

  it('should get from TutorCruncher', async () => {
    nock(TUTORCRUNCHER_API_URL)
        .get(uri => uri.includes('appointments'))
        .reply(200, { response: "tc-response" });

    const tCLessonsUtil = new LessonUtilities('12345');
    const response = await tCLessonsUtil.getLesson(1);
    expect(response.response).to.equal('tc-response');
  });

  it('should get all with all data from TutorCruncher', async () => {
    nock(TUTORCRUNCHER_API_URL)
        .get(uri => uri.includes('appointments'))
        .reply(200, { id: 1 })
        .get(uri => uri.includes('appointments'))
        .reply(200, { id: 2 })
        .get(uri => uri.includes('appointments'))
        .reply(200, { id: 3 });

    const tCLessonsUtil = new LessonUtilities('12345');
    const response = await tCLessonsUtil.getFullLessons([1,2,3]);
    expect(response).to.deep.equal([ {id: 1}, {id: 2}, {id: 3} ]);
  });


});
