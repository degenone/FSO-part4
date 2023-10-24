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
        const res = await api.get('/api/blogs');
        expect(res.body).toHaveLength(testHelper.initialBlogs.length);
    });

    test('should contain specific blog title', async () => {
        const res = await api.get('/api/blogs');
        const titles = res.body.map((b) => b.title);
        expect(titles).toContain(testHelper.initialBlogs[0].title);
    });
});

afterAll(async () => await mongoose.connection.close());
