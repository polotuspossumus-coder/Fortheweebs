import express from 'express';
import Post from '../models/Post';
import User from '../models/User';

export const createPost = express.Router().post('/create', async (req, res) => {
  const user = await User.findById(req.body.userId);
  if (!user || user.banned) return res.status(403).send('Access denied');

  const post = new Post({ userId: user._id, content: req.body.content });
  await post.save();
  user.log.push(`Posted at ${new Date().toISOString()}`);
  await user.save();
  res.status(200).send('Content accepted');
});

export const getFeed = express.Router().get('/feed', async (_, res) => {
  const posts = await Post.find({ flagged: false }).sort({ timestamp: -1 }).limit(50);
  res.status(200).json(posts);
});

export const flagIllegal = express.Router().post('/flag', async (req, res) => {
  const post = await Post.findById(req.body.postId);
  if (!post) return res.status(404).send('Post not found');

  post.flagged = true;
  await post.save();

  const user = await User.findById(post.userId);
  if (user) {
    user.banned = true;
    user.log.push(`Banned for illegal content at ${new Date().toISOString()}`);
    await user.save();
    console.log(`🚨 Reporting user ${user._id} to authorities with content:`, post.content);
  }

  res.status(200).send('User banned and reported');
});
