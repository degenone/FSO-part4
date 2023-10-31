const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcrypt');
const testHelper = require('./test_helper');
const Blog = require('../models/blog');
const app = require('../app');
const User = require('../models/user');
const api = supertest(app);

describe('/api/blogs/ -route tests', () => {
    let token = '';
    beforeAll(async () => {
        await User.deleteMany({});
        for (const u of testHelper.testUsers) {
            const user = new User({
                username: u.username,
                name: u.name,
                passwordHash: await bcrypt.hash(u.password, 10),
            });
            await user.save();
        }
        const userLogin = {
            username: testHelper.testUsers[0].username,
            password: testHelper.testUsers[0].password,
        };
        const result = await api.post('/api/login').send(userLogin);
        token = result.body.token;
    });

    beforeEach(async () => {
        await Blog.deleteMany({});
        const userOne = await User.findOne({
            username: testHelper.testUsers[0].username,
        });
        const blogs = testHelper.initialBlogs
            .filter((b) => b.author === 'Tero K.')
            .map(
                (b) =>
                    new Blog({
                        title: b.title,
                        author: b.author,
                        url: b.url,
                        likes: b.likes,
                        user: userOne._id,
                    })
            );
        await Blog.insertMany(blogs);
        userOne.blogs = [...blogs.map((b) => b._id)];
        await userOne.save();
        const userTwo = await User.findOne({
            username: testHelper.testUsers[1].username,
        });
        const blog = new Blog(testHelper.initialBlogs[3]);
        blog.user = userTwo._id;
        await blog.save();
        userTwo.blogs = [blog._id];
        await userTwo.save();
    });

    describe('blogs-GET', () => {
        test('should get json response', async () => {
            await api
                .get('/api/blogs')
                .expect(200)
                .expect('Content-Type', /application\/json/);
        });

        test('should get three blogs', async () => {
            const res = await api.get('/api/blogs').expect(200);
            expect(res.body).toHaveLength(testHelper.initialBlogs.length);
        });

        test('should contain specific blog title', async () => {
            const res = await api.get('/api/blogs').expect(200);
            const titles = res.body.map((b) => b.title);
            expect(titles).toContain(testHelper.initialBlogs[0].title);
        });

        test('should get blogs with id and user-property', async () => {
            const blogs = await api.get('/api/blogs').expect(200);
            blogs.body.forEach((b) => expect(b.id).toBeDefined());
            blogs.body.forEach((b) => expect(b.user).toBeDefined());
            blogs.body.forEach((b) => expect(b._id).not.toBeDefined());
            blogs.body.forEach((b) => expect(b.__v).not.toBeDefined());
        });
    });

    describe('blogs-POST', () => {
        const newBlog = {
            author: 'Mr. Tester',
            title: 'The importance of thorough testing',
            url: 'https://cooltestblogs.dev/',
            likes: 11,
        };

        test('should create a new blog successfully', async () => {
            const blogsBeforeAct = await testHelper.getBlogsInDb();
            await api
                .post('/api/blogs')
                .set('authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/);
            const blogsAfterAct = await testHelper.getBlogsInDb();
            expect(blogsAfterAct).toHaveLength(blogsBeforeAct.length + 1);
            const titles = blogsAfterAct.map((b) => b.title);
            expect(titles).toContain(newBlog.title);
        });

        test('should create a new blog without likes', async () => {
            const blogsBeforeAct = await testHelper.getBlogsInDb();
            const newNoLikesBlog = {
                author: 'Mr. Tester',
                title: 'The importance of thorough testing',
                url: 'https://cooltestblogs.dev/',
            };
            const result = await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newNoLikesBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/);
            expect(result.body.likes).toBeDefined();
            expect(result.body.likes).toBe(0);
            const blogsAfterAct = await testHelper.getBlogsInDb();
            expect(blogsAfterAct).toHaveLength(blogsBeforeAct.length + 1);
        });

        test('should not create a blog without title', async () => {
            const blogsBeforeAct = await testHelper.getBlogsInDb();
            const newNoTitleBlog = {
                author: 'Mr. Tester',
                url: 'https://cooltestblogs.dev/',
                likes: 11,
            };
            await api
                .post('/api/blogs')
                .set('authorization', `Bearer ${token}`)
                .send(newNoTitleBlog)
                .expect(400);
            const blogsAfterAct = await testHelper.getBlogsInDb();
            expect(blogsAfterAct).toHaveLength(blogsBeforeAct.length);
        });

        test('should not create a blog without url', async () => {
            const blogsBeforeAct = await testHelper.getBlogsInDb();
            const newNoUrlBlog = {
                author: 'Mr. Tester',
                title: 'The importance of thorough testing',
                likes: 11,
            };
            await api
                .post('/api/blogs')
                .set('authorization', `Bearer ${token}`)
                .send(newNoUrlBlog)
                .expect(400);
            const blogsAfterAct = await testHelper.getBlogsInDb();
            expect(blogsAfterAct).toHaveLength(blogsBeforeAct.length);
        });

        test('should fail with invalid token', async () => {
            const blogsBeforeAct = await testHelper.getBlogsInDb();
            await api
                .post('/api/blogs')
                .set('authorization', `Bearer ${token.substring(10)}`)
                .send(newBlog)
                .expect(401);
            const blogsAfterAct = await testHelper.getBlogsInDb();
            expect(blogsAfterAct).toHaveLength(blogsBeforeAct.length);
        });
    });

    describe('blogs-DELETE', () => {
        test('should delete blog with valid id', async () => {
            const blogsBeforeAct = await testHelper.getBlogsInDb();
            const deleteBlog = blogsBeforeAct[0];
            await api
                .delete(`/api/blogs/${deleteBlog.id}`)
                .set('authorization', `Bearer ${token}`)
                .expect(204);
            const blogsAfterAct = await testHelper.getBlogsInDb();
            expect(blogsAfterAct).toHaveLength(blogsBeforeAct.length - 1);
            const ids = blogsAfterAct.map((b) => b.id);
            expect(ids).not.toContain(deleteBlog.id);
        });

        test('should fail with non-existing id', async () => {
            const blogsBeforeAct = await testHelper.getBlogsInDb();
            const nonExistingId = await testHelper.getNonExistingId();
            await api
                .delete(`/api/blogs/${nonExistingId}`)
                .set('authorization', `Bearer ${token}`)
                .expect(404);
            const blogsAfterAct = await testHelper.getBlogsInDb();
            expect(blogsAfterAct).toHaveLength(blogsBeforeAct.length);
        });

        test('should fail with invalid id', async () => {
            const blogsBeforeAct = await testHelper.getBlogsInDb();
            const invalidId = 'invalidId';
            await api
                .delete(`/api/blogs/${invalidId}`)
                .set('authorization', `Bearer ${token}`)
                .expect(400);
            const blogsAfterAct = await testHelper.getBlogsInDb();
            expect(blogsAfterAct).toHaveLength(blogsBeforeAct.length);
        });

        test('should fail with invalid token', async () => {
            const blogsBeforeAct = await testHelper.getBlogsInDb();
            const deleteBlog = blogsBeforeAct[0];
            await api
                .delete(`/api/blogs/${deleteBlog.id}`)
                .set('authorization', `Bearer ${token.substring(10)}`)
                .expect(401);
            const blogsAfterAct = await testHelper.getBlogsInDb();
            expect(blogsAfterAct).toHaveLength(blogsBeforeAct.length);
        });

        test('should fail to delete other users blog', async () => {
            const blogsBeforeAct = await testHelper.getBlogsInDb();
            const deleteBlog = await Blog.findOne({ author: 'Tero E.' });
            await api
                .delete(`/api/blogs/${deleteBlog.id}`)
                .set('authorization', `Bearer ${token}`)
                .expect(403);
            const blogsAfterAct = await testHelper.getBlogsInDb();
            expect(blogsAfterAct).toHaveLength(blogsBeforeAct.length);
        });
    });

    describe('blogs-PUT', () => {
        describe('successful updates', () => {
            test('should update blog likes', async () => {
                const blogs = await testHelper.getBlogsInDb();
                const blogBeforeAct = blogs[0];
                const updatedLikes = { likes: 420 };
                const updatedBlog = await api
                    .put(`/api/blogs/${blogBeforeAct.id}`)
                    .set('authorization', `Bearer ${token}`)
                    .send(updatedLikes)
                    .expect(200);
                expect(updatedBlog.body.likes).toEqual(updatedLikes.likes);
            });

            test('should update blog title', async () => {
                const blogs = await testHelper.getBlogsInDb();
                const blogBeforeAct = blogs[0];
                const updatedTitle = { title: 'Updated blog title.' };
                const updatedBlog = await api
                    .put(`/api/blogs/${blogBeforeAct.id}`)
                    .set('authorization', `Bearer ${token}`)
                    .send(updatedTitle)
                    .expect(200);
                expect(updatedBlog.body.title).toEqual(updatedTitle.title);
            });
        });

        describe('unsuccessful updates', () => {
            test('should fail updating blog author', async () => {
                const blogs = await testHelper.getBlogsInDb();
                const blogBeforeAct = blogs[0];
                const updatedAuthor = { author: 'Updated blog author.' };
                await api
                    .put(`/api/blogs/${blogBeforeAct.id}`)
                    .set('authorization', `Bearer ${token}`)
                    .send(updatedAuthor)
                    .expect(400);
            });

            test('should fail updating blog likes with non-existing id', async () => {
                const nonExistingId = await testHelper.getNonExistingId();
                const updatedLikes = { likes: 420 };
                await api
                    .put(`/api/blogs/${nonExistingId}`)
                    .set('authorization', `Bearer ${token}`)
                    .send(updatedLikes)
                    .expect(404);
            });

            test('should fail updating blog likes with invalid id', async () => {
                const invalidId = 'invalidId';
                const updatedLikes = { likes: 420 };
                await api
                    .put(`/api/blogs/${invalidId}`)
                    .set('authorization', `Bearer ${token}`)
                    .send(updatedLikes)
                    .expect(400);
            });

            test('should fail with invalid token', async () => {
                const blogs = await testHelper.getBlogsInDb();
                const blogBeforeAct = blogs[0];
                const updatedLikes = { likes: 420 };
                const updatedBlog = await api
                    .put(`/api/blogs/${blogBeforeAct.id}`)
                    .set('authorization', `Bearer ${token.substring(10)}`)
                    .send(updatedLikes)
                    .expect(401);
                expect(updatedBlog.body.likes).not.toEqual(updatedLikes.likes);
            });

            test('should fail updating other users blog title', async () => {
                const blogs = await testHelper.getBlogsInDb();
                const blog = blogs.find((b) => b.author === 'Tero E.');
                const updatedTitle = { title: 'new title' };
                await api
                    .put(`/api/blogs/${blog.id}`)
                    .set('authorization', `Bearer ${token}`)
                    .send(updatedTitle)
                    .expect(403);
            });
        });
    });
});

describe('/api/users/ -route tests', () => {
    beforeEach(async () => {
        await User.deleteMany({});
        const passwordHash = await bcrypt.hash(
            testHelper.testUsers[0].password,
            10
        );
        const user = new User({
            username: testHelper.testUsers[0].username,
            passwordHash,
        });
        await user.save();
    });

    describe('users-GET', () => {
        test('should be json response', async () => {
            await api
                .get('/api/users')
                .expect(200)
                .expect('Content-Type', /application\/json/);
        });

        test('should find specific user', async () => {
            const result = await api.get('/api/users').expect(200);
            expect(result.body).toHaveLength(1);
            expect(result.body[0].username).toEqual(
                testHelper.testUsers[0].username
            );
        });

        test('should have blogs -property', async () => {
            const user = await User.findOne({});
            const blog = new Blog({
                author: 'Jake Johnson',
                title: 'Test test tesT',
                url: 'https://example.com/blog/1',
                likes: 1,
                user: user.id,
            });
            await blog.save();
            user.blogs = [blog._id];
            await user.save();
            const result = await api.get('/api/users').expect(200);
            expect(result.body[0].blogs).toHaveLength(1);
        });
    });

    describe('users-POST', () => {
        test('should successfully add new user', async () => {
            const usersBeforeAct = await testHelper.getUsersInDb();
            const newUser = {
                username: 'Newbie',
                name: 'New user',
                password: 'seKred-42',
            };
            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(201);
            expect(result.body.id).toBeDefined();
            expect(result.body.username).toEqual(newUser.username);
            expect(result.body.name).toEqual(newUser.name);
            const usersAfterAct = await testHelper.getUsersInDb();
            expect(usersAfterAct).toHaveLength(usersBeforeAct.length + 1);
        });

        test('should fail with short username', async () => {
            const usersBeforeAct = await testHelper.getUsersInDb();
            const shortUser = {
                username: 'nu',
                name: 'New user',
                password: 'seKred-42',
            };
            const result = await api
                .post('/api/users')
                .send(shortUser)
                .expect(400);
            expect(result.body.error).toContain('(3)');
            const usersAfterAct = await testHelper.getUsersInDb();
            expect(usersAfterAct).toHaveLength(usersBeforeAct.length);
        });

        test('should fail with invalid username', async () => {
            const usersBeforeAct = await testHelper.getUsersInDb();
            const invalidUser = {
                username: 'nuwbi3!!!',
                name: 'New user',
                password: 'seKred-42',
            };
            const result = await api
                .post('/api/users')
                .send(invalidUser)
                .expect(400);
            expect(result.body.error).toContain(
                'can only contain letters or numbers'
            );
            const usersAfterAct = await testHelper.getUsersInDb();
            expect(usersAfterAct).toHaveLength(usersBeforeAct.length);
        });

        test('should fail with bad password', async () => {
            const usersBeforeAct = await testHelper.getUsersInDb();
            const badPwUser = {
                username: 'nuwbi3111',
                name: 'New user',
                password: 'sekred4',
            };
            const result = await api
                .post('/api/users')
                .send(badPwUser)
                .expect(400);
            expect(result.body.error).toContain(
                'password must be at least 8 characters'
            );
            const usersAfterAct = await testHelper.getUsersInDb();
            expect(usersAfterAct).toHaveLength(usersBeforeAct.length);
        });

        test('should fail adding existing user', async () => {
            const usersBeforeAct = await testHelper.getUsersInDb();
            const existingUser = {
                username: testHelper.testUsers[0].username,
                name: testHelper.testUsers[0].name,
                password: testHelper.testUsers[0].password,
            };
            const result = await api
                .post('/api/users')
                .send(existingUser)
                .expect(400);
            expect(result.body.error).toContain('unique');
            const usersAfterAct = await testHelper.getUsersInDb();
            expect(usersAfterAct).toHaveLength(usersBeforeAct.length);
        });

        test('should fail without username', async () => {
            const usersBeforeAct = await testHelper.getUsersInDb();
            const noUsernameUser = {
                name: 'No username',
                password: 'seKred-42',
            };
            const result = await api
                .post('/api/users')
                .send(noUsernameUser)
                .expect(400);
            expect(result.body.error).toContain('required');
            const usersAfterAct = await testHelper.getUsersInDb();
            expect(usersAfterAct).toHaveLength(usersBeforeAct.length);
        });
    });
});

describe('/api/login/ -route tests', () => {
    beforeAll(async () => {
        await User.deleteMany({});
        const passwordHash = await bcrypt.hash(
            testHelper.testUsers[0].password,
            10
        );
        const user = new User({
            username: testHelper.testUsers[0].username,
            passwordHash,
        });
        await user.save();
    });

    test('should log in succesfully', async () => {
        const user = {
            username: testHelper.testUsers[0].username,
            password: testHelper.testUsers[0].password,
        };
        const result = await api.post('/api/login').send(user).expect(200);
        expect(result.body.token).toBeDefined();
    });

    test('should not log in succesfully', async () => {
        const user = {
            username: 'notauser',
            password: 'n0Tapa$$rd',
        };
        await api.post('/api/login').send(user).expect(401);
    });
});

afterAll(async () => await mongoose.connection.close());
