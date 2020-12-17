const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');
const Post = require('../../models/Posts');

const User = require('../../models/User');

// @route   POST api/posts
// @desc    Create a Post
// @access  Private
router.post(
  '/',
  [auth, check('text', 'Text is required').not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors });

    try {
      const user = await User.findById(req.user.id).select('-password');
      const newPost = new Post({
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
      });

      const post = await newPost.save();
      return res.json(post);
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ errors: error });
    }
  }
);

// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

// @route   GET api/posts/:post_id
// @desc    Get all posts
// @access  Private
router.get('/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) return res.status(404).send('post not found');
    return res.json(post);
  } catch (error) {
    if (error.kind === 'ObjectId')
      return res.status(404).send('post not found');
    return res.status(500).json({ error });
  }
});

// @route   DELETE api/posts/:post_id
// @desc    Delete the post
// @access  Private
router.delete('/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    if (post.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'User not authorized' });
    await post.remove();
    return res.json({ msg: 'Post removed' });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

// @route   PUT api/posts/like/:post_id
// @desc    Like the post
// @access  Private
router.put('/like/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    const postuserid = post.user.id;

    //check if already liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: 'Post already liked' });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    return res.json(post.likes);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

// @route   PUT api/posts/unlike/:post_id
// @desc    Like the post
// @access  Private
router.put('/unlike/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    //check if already liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: 'Post has not yet liked' });
    }
    //post.likes.unshift({user: req.user.id});
    //get the index
    const index = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(index, 1);
    await post.save();
    return res.json(post.likes);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

// @route   POST api/posts/comments/:post_id
// @desc    Comment on a post
// @access  Private
router.post(
  '/comments/:post_id',
  [auth, check('text', 'Text is required').not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors });

    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.post_id);

      const newComment = {
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
      };

      post.comments.unshift(newComment);

      await post.save();
      return res.json(post.comments);
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ errors: error });
    }
  }
);

// @route   DELETE api/posts/comments/:post_id/:comment_id
// @desc    Delete the post
// @access  Private
router.delete('/comments/:post_id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    // pull out comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    //make sure comment exist
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });
    //check the user deleting the comment
    if (comment.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'User not authorized' });

    const index = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(index, 1);

    await post.save();

    return res.json(post.comments);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

module.exports = router;
