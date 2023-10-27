const blogsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
require('express-async-errors');
const Blog = require('../models/blog');
const User = require('../models/user');
const logger = require('../utils/logger');

blogsRouter.get('/', async (req, res) => {
    const blogs = await Blog.find({}).populate('user', {
        username: 1,
        name: 1,
        id: 1,
    });
    res.json(blogs);
});

blogsRouter.post('/', async (req, res, next) => {
    const token = jwt.verify(req.token, process.env.SECRET);
    if (!token.id) {
        return res.status(401).json({ error: 'invalid token' });
    }
    const body = req.body;
    if (!body.title || !body.url) {
        return res
            .status(400)
            .json({ error: 'required properties missing: title, url' });
    }
    const user = await User.findById(token.id);
    const blog = new Blog({
        author: body.author,
        user: user._id,
        title: body.title,
        url: body.url,
        likes: body.likes || 0,
    });
    const newBlog = await blog.save();
    user.blogs = [...user.blogs, newBlog._id];
    await user.save();
    res.status(201).json(newBlog);
});

blogsRouter.delete('/:id', async (req, res, next) => {
    const deletedBlog = await Blog.findById(req.params.id);
    if (!deletedBlog) {
        return res.status(404).end();
    }
    const token = jwt.verify(req.token, process.env.SECRET);
    if (!token.id) {
        return res.status(401).json({ error: 'invalid token' });
    }
    if (deletedBlog.user.toString() !== token.id.toString()) {
        return res.status(403).end();
    }
    await Blog.deleteOne({ _id: deletedBlog._id });
    res.status(204).end();
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
