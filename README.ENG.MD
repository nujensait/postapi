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
- [Todo](#todo)

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

To get API reference and available methods, open in browser or make GET request:

```
GET http://localhost:3005/
```

Response will contain:
- Welcome message
- API version
- List of all available endpoints with descriptions
- Authorization requirements
- Usage examples

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

Load (import) data from file: [postman.json](postman.json) 

Or run separate postman queries:
```
# auth
URL: http://localhost:3005/auth/login
Method: POST
Headers: Content-Type: application/json
Body (raw JSON):
{
  "username": "newuser",
  "password": "password123"
}

# create post
URL: http://localhost:3005/posts
Method: POST
Headers:
  Content-Type: application/json
  Authorization: Bearer [Token]  // Replace [Token] with the token received during authentication
Body (raw JSON):
{
  "title": "New Post Title",
  "description": "Description of the new post."
}

# get posts
URL: http://localhost:3005/posts
Method: GET
Headers: None

# update post
URL: http://localhost:3005/posts/1  // Replace '1' with the ID of the post you want to update
Method: PUT
Headers:
  Content-Type: application/json
  Authorization: Bearer [Token]
Body (raw JSON):
{
  "title": "Updated Post Title",
  "description": "Updated description of the post."
}

# delete post
URL: http://localhost:3005/posts/1  // Replace '1' with the ID of the post you want to delete
Method: DELETE
Headers:
  Authorization: Bearer [Token]
```

## Todo
- use authMiddleware on posts CRUD operations (now auth is skipped here)
- fix error on registration/auth - not working now