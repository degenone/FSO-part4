const blogsRouter = require('express').Router();
require('express-async-errors');
const Blog = require('../models/blog');
const middleware = require('../utils/middleware');

blogsRouter.get('/', async (req, res) => {
    const blogs = await Blog.find({}).populate('user', {
        username: 1,
        name: 1,
        id: 1,
    });
    res.json(blogs);
});

blogsRouter.post('/:id/comments', async (req, res, next) => {
    const { comment } = req.body;
    if (!comment) {
        return res
            .status(400)
            .json({ error: 'required property missing: comment' });
    }
    if (comment.length < 3) {
        return res
            .status(400)
            .json({ error: 'comment must be at least 3 characters long' });
    }
    const blog = await Blog.findByIdAndUpdate(req.params.id, {
        $push: { comments: comment },
    });
    if (blog) {
        res.status(201).end();
    }
    res.status(404).end();
});

blogsRouter.post('/', middleware.userExtractor, async (req, res, next) => {
    const body = req.body;
    if (!body.title || !body.url) {
        return res
            .status(400)
            .json({ error: 'required properties missing: title, url' });
    }
    const user = req.user;
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

blogsRouter.delete('/:id', middleware.userExtractor, async (req, res, next) => {
    const deletedBlog = await Blog.findById(req.params.id);
    if (!deletedBlog) {
        return res.status(404).end();
    }
    if (deletedBlog.user.toString() !== req.user.id.toString()) {
        return res.status(403).end();
    }
    await Blog.deleteOne({ _id: deletedBlog._id });
    res.status(204).end();
});

blogsRouter.put('/:id', middleware.userExtractor, async (req, res, next) => {
    const { likes, title } = req.body;
    if (!likes && !title) {
        return res.status(400).end();
    }
    const blogToUpdate = await Blog.findById(req.params.id);
    if (!blogToUpdate) {
        return res.status(404).end();
    }
    if (title) {
        if (blogToUpdate.user.toString() !== req.user._id.toString()) {
            return res.status(403).end();
        }
        blogToUpdate.title = title;
    }
    blogToUpdate.likes = likes || blogToUpdate.likes;
    await blogToUpdate.save();
    res.json(blogToUpdate);
});

module.exports = blogsRouter;
