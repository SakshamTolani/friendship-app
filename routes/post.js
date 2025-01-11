const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin");
const Post = mongoose.model("Post");

// Get All Posts
router.get("/allpost", requireLogin, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("postedBy", "_id name pic")
      .sort("-createdAt");
    res.json({ posts });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Get Subscribed Posts
router.get("/getsubpost", requireLogin, async (req, res) => {
  try {
    const posts = await Post.find({ postedBy: { $in: req.user.following } })
      .populate("postedBy", "_id name pic")
      .sort("-createdAt");
    res.json({ posts });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Create a Post
router.post("/createpost", requireLogin, async (req, res) => {
  const { title, body, pic } = req.body;
  if (!title || !body || !pic) {
    return res.status(401).json({ error: "Enter all required fields" });
  }
  try {
    req.user.password = undefined;
    console.log(req.user);
    const post = new Post({
      title,
      body,
      photo: pic,
      postedBy: req.user,
    });
    const result = await post.save();
    res.json({ post: result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Get User's Posts
router.get("/mypost", requireLogin, async (req, res) => {
  try {
    const mypost = await Post.find({ postedBy: req.user._id }).populate("postedBy", "_id name");
    res.json({ mypost });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Like a Post
router.put("/like", requireLogin, async (req, res) => {
  try {
    const result = await Post.findByIdAndUpdate(
      req.body.postId,
      { $push: { likes: req.user._id } },
      { new: true }
    );
    res.json(result);
  } catch (err) {
    return res.status(422).json({ error: err.message });
  }
});

// Unlike a Post
router.put("/unlike", requireLogin, async (req, res) => {
  try {
    const result = await Post.findByIdAndUpdate(
      req.body.postId,
      { $pull: { likes: req.user._id } },
      { new: true }
    );
    res.json(result);
  } catch (err) {
    return res.status(422).json({ error: err.message });
  }
});

// Add a Comment to a Post
router.put("/comment", requireLogin, async (req, res) => {
  const comment = {
    text: req.body.text,
    postedBy: req.user._id,
  };
  try {
    const result = await Post.findByIdAndUpdate(
      req.body.postId,
      { $push: { comments: comment } },
      {
        new: true,
        runValidators: true
      }
    )
      .populate("comments.postedBy", "_id name pic")
      .populate("postedBy", "_id name");
    res.json(result);
  } catch (err) {
    console.error("Comment error:", err);
    return res.status(422).json({ error: err.message });
  }
});

// Delete a Post
router.delete("/deletepost/:postId", requireLogin, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId }).populate("postedBy", "_id");
    if (!post) {
      return res.status(422).json({ error: "Post not found" });
    }
    if (post.postedBy._id.toString() === req.user._id.toString()) {
      const result = await post.remove();
      res.json(result);
    } else {
      res.status(403).json({ error: "Unauthorized to delete this post" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Delete a Comment from a Post
router.delete("/deletecomment/:id/:comment_id", requireLogin, async (req, res) => {
  const comment = { _id: req.params.comment_id };
  try {
    const postComment = await Post.findByIdAndUpdate(
      req.params.id,
      { $pull: { comments: comment } },
      { new: true }
    )
      .populate("comments.postedBy", "_id name")
      .populate("postedBy", "_id name");
    if (!postComment) {
      return res.status(422).json({ error: "Post or comment not found" });
    }
    res.json(postComment);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
