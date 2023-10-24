const Blog = require('../models/blog');

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

const getBlogsInDb = async () => {
    const blogs = await Blog.find({});
    return blogs.map((b) => b.toJSON());
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
    getBlogsInDb,
    getNonExistingId,
};
