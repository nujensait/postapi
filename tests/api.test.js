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
        test('GET / - должен вернуть приветствие и справку по API', async () => {
            const response = await request(app)
                .get('/')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('version');
            expect(response.body).toHaveProperty('endpoints');
            expect(response.body.endpoints).toHaveProperty('auth');
            expect(response.body.endpoints).toHaveProperty('posts');
            expect(response.body).toHaveProperty('server');
            expect(response.body.server.port).toBe(3005);
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
            const response = await request(app)
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
            const response = await request(app)
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
            const response = await request(app)
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
            const response = await request(app)
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
            const response = await request(app)
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
            const response = await request(app)
                .put(`/posts/${testPostId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({})
                .expect(400);
        });

        test('DELETE /posts/:id - должен вернуть ошибку без авторизации', async () => {
            const response = await request(app)
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
            const verifyDeleteResponse = await request(app)
                .delete(`/posts/${postId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });
    });
});
