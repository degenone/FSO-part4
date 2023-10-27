const Blog = require('../models/blog');
const User = require('../models/user');

const initialBlogs = [
    {
        title: 'My first Blog!',
        author: 'Tero K.',
        url: 'https://coolblogs.dev/1',
        likes: 0,
    },
    {
        title: 'My second Blog!',
        author: 'Tero K.',
        url: 'https://coolblogs.dev/2',
        likes: 4,
    },
    {
        title: 'My cool Blog',
        author: 'Tero K.',
        url: 'https://coolblogs.dev/3',
        likes: 21,
    },
    {
        title: 'My melancholy Blog',
        author: 'Tero E.',
        url: 'https://coolblogs.dev/4',
        likes: 18,
    },
];

const testUsers = [
    {
        username: 'testuser1',
        name: 'Test User One',
        password: 'pa$swOrd*123',
    },
    {
        username: 'testuser2',
        name: 'Test User Two',
        password: 'pa$swOrd*456',
    },
];

const getBlogsInDb = async () => {
    const blogs = await Blog.find({});
    return blogs.map((b) => b.toJSON());
};

const getUsersInDb = async () => {
    const users = await User.find({});
    return users.map((b) => b.toJSON());
};

const getNonExistingId = async () => {
    const blog = new Blog({
        title: 'tmp-title',
        url: 'tmp-url',
    });
    await blog.save();
    await blog.deleteOne();
    return blog._id.toString();
};

module.exports = {
    initialBlogs,
    testUsers,
    getBlogsInDb,
    getUsersInDb,
    getNonExistingId,
};
