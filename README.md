# Tutor Cruncher Utilities
Utility functions for interacting with TutorCruncher APIs

## Usage

`npm install @unegma/tutorcruncher-utilities --save`

```
const {
  TUTORCRUNCHER_KEY,
  SLACK_ERROR_LOG
} = process.env;
const { LessonUtilities, ClientUtilities, JobUtilities,
  PaymentUtilities, BaseUtilities } = require('@unegma/tutorcruncher-utilities');
const tCLib = new BaseUtilities(TUTORCRUNCHER_KEY, SLACK_ERROR_LOG);
const tCLessonLib = new LessonUtilities(TUTORCRUNCHER_KEY, SLACK_ERROR_LOG);

...
// get all lessons
tCLessonLib.getAllLessons();

// raw request (use if no wrapper function built yet)
tCLib.postToTC(`/proforma-invoices/`, data);

// useful low level functions
const myExtraAttributeValue = tCLib.getAttValue(user.extra_attrs, 'my_custom_attr');
```

