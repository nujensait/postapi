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

## Setup
```
# setup libs
npm install express sqlite3 bcryptjs jsonwebtoken

# run app
npm run dev

# run migrations
node .\db\database.js
```

## Test

Load (import) data from file: postman.json 

Or run separate postman queries:
```
# auth
URL: http://localhost:3000/auth/login
Method: POST
Headers: Content-Type: application/json
Body (raw JSON):
{
  "username": "newuser",
  "password": "password123"
}

# create post
URL: http://localhost:3000/posts
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
URL: http://localhost:3000/posts
Method: GET
Headers: None

# update post
URL: http://localhost:3000/posts/1  // Replace '1' with the ID of the post you want to update
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
URL: http://localhost:3000/posts/1  // Replace '1' with the ID of the post you want to delete
Method: DELETE
Headers:
  Authorization: Bearer [Token]
```