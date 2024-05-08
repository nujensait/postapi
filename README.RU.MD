## Задача
Реализовать решение следующей задачи на Nodejs.
Нужно реализовать CRUD API, позволяющее пользователям манипулировать постами.

Требуется реализация API на Nodejs, которое позволяет:
- Зарегистрировать и аутентифицировать пользователя
- Регулировать права пользователя (спектр возможностей при манипуляции с постами)
- Создавать зарегистрированному пользователю новые посты с описанием
- Просматривать посты незарегистрированному пользователю
- Удалять и изменять посты пользователю, обладающему достаточными правами
- Удалять или изменять посты пользователю, являющимся автором поста

## Установка
```
npm install express sqlite3 bcryptjs jsonwebtoken

# run app
npm run dev

# run migrations
node .\db\database.js

```

## Проверка

Загрузить (импортировать) данные из файла: postman.json

Или запустите отдельные запросы Postman:

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
  Authorization: Bearer [Token]  // Замените [Token] на токен, полученный при аутентификации
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
URL: http://localhost:3000/posts/1  // Замените '1' на ID поста, который вы хотите обновить
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
URL: http://localhost:3000/posts/1  // Замените '1' на ID поста, который вы хотите удалить
Method: DELETE
Headers:
  Authorization: Bearer [Token]
```