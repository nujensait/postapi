( [README IN RUSSIAN](README.MD) )
( [TESTS](tests/README.md) )

---

## Table of Contents

- [What is this?](#what-is-this)
- [Task](#task)
  - [Additional Terms](#additional-terms)
  - [Result](#result)
  - [Result evaluation (main criteria)](#result-evaluation-main-criteria)
- [Setup](#setup)
  - [Option 1: Install using script (recommended)](#option-1-install-using-script-recommended)
  - [Option 2: Install manually](#option-2-install-manually)
  - [Run application](#run-application)
- [API Reference](#api-reference)
- [Automated Tests](#automated-tests)
- [Manual Test](#manual-test)
- [Contacts](#contacts)

---

## What is this?
Problem with hackathon "Express CRUD", dated 05/08/2024

As part of the hackathon, participants
implement CRUD API, advanced users
manipulate posts

## Task
Implement a solution to this problem in Nodejs.
It is necessary to implement a CRUD API so that users can manipulate posts.

An API implementation in Nodejs is required, which allows:
- Register and authenticate the user
- Regulate user rights (range of possibilities when manipulating posts)
- Create new posts with descriptions for the registered user.
- View messages to an unregistered user.
- Delete and change posts for a user with available rights.
- Delete or change posts for the user who is the author of the post.

### Additional Terms
Participants who have fulfilled the basic conditions
it is proposed to implement additional features,
bringing bonus points:
- Ability to like posts
- Ability to ban users if available
  certain rights
- Ability to leave comments
  Note:
- Additional conditions are optional;
- Any order of execution is allowed
  additional conditions;
- Compliance with additional conditions is not
  is counted without completing all points of the main
  conditions.

### Result
Need to represent a collection in Postman with
requests that implement the functionality described in
task.

You also need to post the project code in
public repository

### Result evaluation (main criteria)
- Completeness of the solution
- Quality of code organization
- Correctness of using certain approaches
  for API organization

----

## Setup

### Option 1: Install using script (recommended)
```bash
# For Windows
scripts\install-dependencies.bat

# For Linux/Mac
chmod +x scripts/install-dependencies.sh
./scripts/install-dependencies.sh
```

### Option 2: Install manually
```bash
# install all dependencies from package.json
npm install

# or install manually (see dependencies.txt for versions)
npm install express sqlite3 bcryptjs jsonwebtoken
npm install --save-dev jest supertest nodemon
```

All required dependencies are listed in [dependencies.txt](dependencies.txt)

### Run application
```bash
# run app
npm run dev

# run migrations
node .\db\database.js
```

## API Reference

### Swagger UI (Interactive Documentation)

To access full interactive API documentation, open in browser:

```
http://localhost:3005/
```

or directly:

```
http://localhost:3005/api-docs
```

Swagger UI provides:
- Complete description of all endpoints
- Interactive API testing directly in browser
- Data schemas and request/response examples
- Authorization and request execution capabilities

**Note:** Root path `/` automatically redirects to `/api-docs`

## Automated Tests

Run automated API tests:
```bash
# run all tests
npm test

# run tests in watch mode
npm run test:watch

# run tests with coverage report
npm test -- --coverage
```

See [tests/README.md](tests/README.md) for more details about the test suite.

## Manual Test

Load (import) data from file: [tests/postman.json](tests/postman.json) 

## Contacts

Mikhail Ikonnikov <mishaikon@gmail.com>