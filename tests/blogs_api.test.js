const mongoose = require('mongoose');
const supertest = require('supertest');
const testHelper = require('./test_helper');
const Blog = require('../models/blog');
const app = require('../app');
const api = supertest(app);

beforeEach(async () => {
    await Blog.deleteMany({});
    await Blog.insertMany(testHelper.initialBlogs.map((b) => new Blog(b)));
});

describe('blogs api GET method tests', () => {
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

    test('should get blogs with id-property', async () => {
        const blogs = await api.get('/api/blogs').expect(200);
        blogs.body.forEach((b) => expect(b.id).toBeDefined());
        blogs.body.forEach((b) => expect(b._id).not.toBeDefined());
        blogs.body.forEach((b) => expect(b.__v).not.toBeDefined());
    });
});

describe('blogs api POST method tests', () => {
    const newBlog = {
        author: 'Mr. Tester',
        title: 'The importance of thorough testing',
        url: 'https://cooltestblogs.dev/',
        likes: 11,
    };
    const newNoLikesBlog = {
        author: 'Mr. Tester',
        title: 'The importance of thorough testing',
        url: 'https://cooltestblogs.dev/',
    };
    const newNoTitleBlog = {
        author: 'Mr. Tester',
        url: 'https://cooltestblogs.dev/',
        likes: 11,
    };
    const newNoUrlBlog = {
        author: 'Mr. Tester',
        title: 'The importance of thorough testing',
        likes: 11,
    };

    test('should create a new blog correctly', async () => {
        const blogsBeforeAct = await testHelper.getBlogsInDb();
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/);
        const blogsAfterAct = await testHelper.getBlogsInDb();
        expect(blogsAfterAct).toHaveLength(blogsBeforeAct.length + 1);
        const titles = blogsAfterAct.map((b) => b.title);
        expect(titles).toContain(newBlog.title);
    });

    test('should create a new blog without likes', async () => {
        const result = await api
            .post('/api/blogs')
            .send(newNoLikesBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/);
        expect(result.body.likes).toBeDefined();
        expect(result.body.likes).toBe(0);
    });

    test('should not create a blog without title', async () => {
        await api.post('/api/blogs').send(newNoTitleBlog).expect(400);
    });

    test('should not create a blog without ulr', async () => {
        await api.post('/api/blogs').send(newNoUrlBlog).expect(400);
    });
});

afterAll(async () => await mongoose.connection.close());
