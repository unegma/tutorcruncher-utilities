# Tutor Cruncher Utilities
Utility functions for interacting with TutorCruncher APIs

## Usage

```
const {
  TUTORCRUNCHER_KEY
} = process.env;
const { TutorCruncherUtilities } = require('@unegma/tutorcruncher-utilities');
const tCUtil = new TutorCruncherUtilities(TUTORCRUNCHER_KEY);

...

// get all lessons
tCUtil.getAllLessons();

```
