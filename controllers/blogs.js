const blogsRouter = require('express').Router();
require('express-async-errors');
const Blog = require('../models/blog');

blogsRouter.get('/', async (req, res) => {
    const blogs = await Blog.find({});
    res.json(blogs);
});

blogsRouter.post('/', async (req, res, next) => {
    const body = req.body;
    if (!body.title || !body.url) {
        return res.status(400).end();
    }
    const blog = new Blog({
        author: body.author,
        title: body.title,
        url: body.url,
        likes: body.likes || 0,
    });
    const newBlog = await blog.save();
    res.status(201).json(newBlog);
});

blogsRouter.delete('/:id', async (req, res, next) => {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (deletedBlog) {
        res.status(204).end();
    } else {
        res.status(404).end();
    }
});

blogsRouter.put('/:id', async (req, res, next) => {
    const { likes, title } = req.body;
    if (!likes && !title) {
        return res.status(400).end();
    }
    const updatedBlog = await Blog.findByIdAndUpdate(
        req.params.id,
        { likes, title },
        { new: true }
    );
    if (updatedBlog) {
        res.json(updatedBlog);
    } else {
        res.status(404).end();
    }
});

module.exports = blogsRouter;
