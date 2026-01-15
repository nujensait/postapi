const request = require('supertest');
const app = require('../app');
const db = require('../db/database');

describe('API Tests', () => {
    let authToken;
    let authToken2;
    let testPostId;
    let testUser;
    let testUser2;

    // Очистка тестовых данных перед запуском тестов
    beforeAll((done) => {
        // Можно добавить очистку тестовой БД или создание тестовых данных
        done();
    });

    afterAll((done) => {
        // Закрытие соединения с БД после тестов
        db.close();
        done();
    });

    describe('Root API', () => {
        test('GET / - должен перенаправить на /api-docs', async () => {
            const response = await request(app)
                .get('/')
                .expect(302);

            expect(response.headers.location).toBe('/api-docs');
        });
    });

    describe('Auth API', () => {
        test('POST /auth/register - должен зарегистрировать нового пользователя', async () => {
            testUser = {
                username: 'testuser_' + Date.now(),
                password: 'testpassword123'
            };

            const response = await request(app)
                .post('/auth/register')
                .send(testUser)
                .expect('Content-Type', /text/)
                .expect(201);

            expect(response.text).toBe('User registered');
        });

        test('POST /auth/register - должен зарегистрировать второго пользователя', async () => {
            testUser2 = {
                username: 'testuser2_' + Date.now(),
                password: 'testpassword456'
            };

            const response = await request(app)
                .post('/auth/register')
                .send(testUser2)
                .expect('Content-Type', /text/)
                .expect(201);

            expect(response.text).toBe('User registered');
        });

        test('POST /auth/register - должен вернуть ошибку при дублировании пользователя', async () => {
            await request(app)
                .post('/auth/register')
                .send(testUser)
                .expect(400);
        });

        test('POST /auth/login - должен аутентифицировать пользователя и вернуть токен', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    username: testUser.username,
                    password: testUser.password
                })
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('token');
            expect(typeof response.body.token).toBe('string');
            authToken = response.body.token; // Сохраняем токен для последующих тестов
        });

        test('POST /auth/login - должен аутентифицировать второго пользователя и вернуть токен', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    username: testUser2.username,
                    password: testUser2.password
                })
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('token');
            authToken2 = response.body.token; // Сохраняем токен второго пользователя
        });

        test('POST /auth/login - должен вернуть ошибку при неверных учетных данных', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    username: testUser.username,
                    password: 'wrongpassword'
                })
                .expect(401);

            expect(response.text).toBe('Authentication failed');
        });

        test('POST /auth/login - должен вернуть ошибку при несуществующем пользователе', async () => {
            await request(app)
                .post('/auth/login')
                .send({
                    username: 'nonexistentuser',
                    password: 'somepassword'
                })
                .expect(401);
        });
    });

    describe('Posts API', () => {
        const testPost = {
            title: 'Test Post Title',
            description: 'Test post description'
        };

        test('POST /posts - должен вернуть ошибку без авторизации', async () => {
            await request(app)
                .post('/posts')
                .send(testPost)
                .expect(401);
        });

        test('POST /posts - должен создать новый пост с авторизацией', async () => {
            const response = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testPost)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body.title).toBe(testPost.title);
            expect(response.body.description).toBe(testPost.description);
            expect(response.body.author).toBe(testUser.username);
            testPostId = response.body.id; // Сохраняем ID для последующих тестов
        });

        test('POST /posts - должен вернуть ошибку при отсутствии обязательных полей', async () => {
            await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Only title'
                })
                .expect(400);
        });

        test('GET /posts - должен вернуть список всех постов', async () => {
            const response = await request(app)
                .get('/posts')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            
            // Проверяем структуру поста
            const post = response.body[0];
            expect(post).toHaveProperty('id');
            expect(post).toHaveProperty('title');
            expect(post).toHaveProperty('description');
        });

        test('PUT /posts/:id - должен вернуть ошибку без авторизации', async () => {
            await request(app)
                .put(`/posts/${testPostId}`)
                .send({
                    title: 'Updated Title'
                })
                .expect(401);
        });

        test('PUT /posts/:id - должен вернуть ошибку при попытке обновить чужой пост', async () => {
            const response = await request(app)
                .put(`/posts/${testPostId}`)
                .set('Authorization', `Bearer ${authToken2}`)
                .send({
                    title: 'Trying to update someone elses post',
                    description: 'This should fail'
                })
                .expect(403);

            expect(response.body.error).toBe('Нет прав для обновления этого поста');
        });

        test('PUT /posts/:id - должен обновить свой пост', async () => {
            const updatedData = {
                title: 'Updated Test Post Title',
                description: 'Updated test post description'
            };

            const response = await request(app)
                .put(`/posts/${testPostId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updatedData)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('Пост успешно обновлен');
            expect(response.body.updatedRows).toBeGreaterThan(0);
        });

        test('PUT /posts/:id - должен вернуть ошибку при обновлении несуществующего поста', async () => {
            const response = await request(app)
                .put('/posts/99999')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Updated Title',
                    description: 'Updated Description'
                })
                .expect(404);

            expect(response.body.error).toBe('Пост не найден или данные не изменены');
        });

        test('PUT /posts/:id - должен вернуть ошибку при отсутствии данных для обновления', async () => {
            await request(app)
                .put(`/posts/${testPostId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({})
                .expect(400);
        });

        test('DELETE /posts/:id - должен вернуть ошибку без авторизации', async () => {
            await request(app)
                .delete(`/posts/${testPostId}`)
                .expect(401);
        });

        test('DELETE /posts/:id - должен вернуть ошибку при попытке удалить чужой пост', async () => {
            const response = await request(app)
                .delete(`/posts/${testPostId}`)
                .set('Authorization', `Bearer ${authToken2}`)
                .expect(403);

            expect(response.body.error).toBe('Нет прав для удаления этого поста');
        });

        test('DELETE /posts/:id - должен удалить свой пост', async () => {
            const response = await request(app)
                .delete(`/posts/${testPostId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('Пост успешно удален');
            expect(response.body.deletedRows).toBeGreaterThan(0);
        });

        test('DELETE /posts/:id - должен вернуть ошибку при удалении несуществующего поста', async () => {
            const response = await request(app)
                .delete('/posts/99999')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body.error).toBe('Пост не найден');
        });

        test('DELETE /posts/:id - должен вернуть ошибку при удалении уже удаленного поста', async () => {
            const response = await request(app)
                .delete(`/posts/${testPostId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body.error).toBe('Пост не найден');
        });
    });

    describe('Integration Tests', () => {
        test('Полный цикл: создание, получение, обновление и удаление поста с авторизацией', async () => {
            // 1. Создание поста
            const createResponse = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Integration Test Post',
                    description: 'Integration test description'
                })
                .expect(201);

            const postId = createResponse.body.id;
            expect(createResponse.body.author).toBe(testUser.username);

            // 2. Получение всех постов и проверка наличия созданного
            const getAllResponse = await request(app)
                .get('/posts')
                .expect(200);

            const createdPost = getAllResponse.body.find(p => p.id === postId);
            expect(createdPost).toBeDefined();
            expect(createdPost.title).toBe('Integration Test Post');

            // 3. Обновление поста
            const updateResponse = await request(app)
                .put(`/posts/${postId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Updated Integration Test Post',
                    description: 'Updated integration test description'
                })
                .expect(200);

            expect(updateResponse.body.message).toBe('Пост успешно обновлен');

            // 4. Удаление поста
            const deleteResponse = await request(app)
                .delete(`/posts/${postId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(deleteResponse.body.message).toBe('Пост успешно удален');

            // 5. Проверка, что пост удален
            await request(app)
                .delete(`/posts/${postId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });
    });

    describe('Posts API - Additional Methods', () => {
        let singlePostId;

        test('GET /posts/:id - должен вернуть один пост по ID', async () => {
            // Сначала создадим пост
            const createResponse = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Single Post Test',
                    description: 'Test description for single post'
                })
                .expect(201);

            singlePostId = createResponse.body.id;

            // Теперь получим его по ID
            const response = await request(app)
                .get(`/posts/${singlePostId}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('id', singlePostId);
            expect(response.body).toHaveProperty('title', 'Single Post Test');
            expect(response.body).toHaveProperty('description');
        });

        test('GET /posts/:id - должен вернуть 404 для несуществующего поста', async () => {
            const response = await request(app)
                .get('/posts/99999')
                .expect(404);

            expect(response.body.error).toBe('Пост не найден');
        });

        test('GET /posts?page=1&limit=5 - должен вернуть посты с пагинацией', async () => {
            const response = await request(app)
                .get('/posts?page=1&limit=5')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('items');
            expect(response.body).toHaveProperty('page', 1);
            expect(response.body).toHaveProperty('limit', 5);
            expect(response.body).toHaveProperty('total');
            expect(Array.isArray(response.body.items)).toBe(true);
            expect(response.body.items.length).toBeLessThanOrEqual(5);
        });

        test('GET /posts?author=username - должен фильтровать посты по автору', async () => {
            const response = await request(app)
                .get(`/posts?author=${testUser.username}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('items');
            expect(Array.isArray(response.body.items)).toBe(true);
            
            // Проверяем, что все посты от указанного автора
            response.body.items.forEach(post => {
                expect(post.author).toBe(testUser.username);
            });
        });

        test('GET /posts?search=text - должен искать посты по тексту', async () => {
            const response = await request(app)
                .get('/posts?search=Single')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('items');
            expect(Array.isArray(response.body.items)).toBe(true);
            
            // Проверяем, что найденные посты содержат искомый текст
            response.body.items.forEach(post => {
                const containsInTitle = post.title.toLowerCase().includes('single');
                const containsInDescription = post.description.toLowerCase().includes('single');
                expect(containsInTitle || containsInDescription).toBe(true);
            });
        });
    });

    describe('Users API', () => {
        test('GET /users/me - должен вернуть профиль текущего пользователя', async () => {
            const response = await request(app)
                .get('/users/me')
                .set('Authorization', `Bearer ${authToken}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('username', testUser.username);
        });

        test('GET /users/me - должен вернуть 401 без авторизации', async () => {
            await request(app)
                .get('/users/me')
                .expect(401);
        });

        test('GET /users/:id - должен вернуть пользователя по ID', async () => {
            // Получаем ID текущего пользователя
            const meResponse = await request(app)
                .get('/users/me')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            const userId = meResponse.body.id;

            // Получаем пользователя по ID
            const response = await request(app)
                .get(`/users/${userId}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('id', userId);
            expect(response.body).toHaveProperty('username', testUser.username);
            expect(response.body).not.toHaveProperty('password');
        });

        test('GET /users/:id - должен вернуть 404 для несуществующего пользователя', async () => {
            const response = await request(app)
                .get('/users/99999')
                .expect(404);

            expect(response.body.error).toBe('Пользователь не найден');
        });

        test('GET /users - должен вернуть список всех пользователей', async () => {
            const response = await request(app)
                .get('/users')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            
            // Проверяем структуру пользователя
            const user = response.body[0];
            expect(user).toHaveProperty('id');
            expect(user).toHaveProperty('username');
            expect(user).not.toHaveProperty('password');
        });

        test('PUT /users/me - должен обновить профиль пользователя', async () => {
            const newUsername = 'updated_user_' + Date.now();

            const response = await request(app)
                .put('/users/me')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ username: newUsername })
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.message).toBe('Профиль успешно обновлен');

            // Проверяем, что username действительно изменился
            const meResponse = await request(app)
                .get('/users/me')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(meResponse.body.username).toBe(newUsername);
            
            // Обновляем testUser для последующих тестов
            testUser.username = newUsername;
        });

        test('PUT /users/me - должен вернуть ошибку без username', async () => {
            const response = await request(app)
                .put('/users/me')
                .set('Authorization', `Bearer ${authToken}`)
                .send({})
                .expect(400);

            expect(response.body.error).toBe('Username обязателен');
        });

        test('POST /users/password - должен изменить пароль пользователя', async () => {
            const oldPassword = testUser.password;
            const newPassword = 'newpassword123';

            const response = await request(app)
                .post('/users/password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    oldPassword: oldPassword,
                    newPassword: newPassword
                })
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.message).toBe('Пароль успешно изменен');

            // Проверяем, что старый пароль больше не работает
            await request(app)
                .post('/auth/login')
                .send({
                    username: testUser.username,
                    password: oldPassword
                })
                .expect(401);

            // Проверяем, что новый пароль работает
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    username: testUser.username,
                    password: newPassword
                })
                .expect(200);

            expect(loginResponse.body).toHaveProperty('token');
            
            // Обновляем testUser и authToken для последующих тестов
            testUser.password = newPassword;
            authToken = loginResponse.body.token;
        });

        test('POST /users/password - должен вернуть ошибку при неверном старом пароле', async () => {
            const response = await request(app)
                .post('/users/password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    oldPassword: 'wrongoldpassword',
                    newPassword: 'newpassword456'
                })
                .expect(400);

            expect(response.body.error).toBe('Неверный старый пароль');
        });

        test('POST /users/password - должен вернуть ошибку без обязательных полей', async () => {
            const response = await request(app)
                .post('/users/password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    oldPassword: 'somepassword'
                })
                .expect(400);

            expect(response.body.error).toBe('Старый и новый пароль обязательны');
        });
    });
});
