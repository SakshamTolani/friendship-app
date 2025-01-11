//user.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const Post = mongoose.model("Post");
const User = mongoose.model("User");

// Get User and Posts
router.get("/user/:id", requireLogin, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }

    const posts = await Post.find({ postedBy: req.params.id }).populate("postedBy", "_id name");
    return res.json({ user, posts });
  } catch (err) {
    return res.status(422).json({ error: err.message });
  }
});

// Send Friend Request
router.put('/send-friend-request', requireLogin, async (req, res) => {
  try {
    // Check if request already exists
    const existingRequest = await User.findOne({
      _id: req.body.userId,
      'friendRequests.from': req.user._id
    });

    if (existingRequest) {
      return res.status(422).json({ error: "Friend request already sent" });
    }

    // Add to recipient's friendRequests
    const recipient = await User.findByIdAndUpdate(req.body.userId, {
      $push: {
        friendRequests: {
          from: req.user._id,
          status: 'pending'
        }
      }
    }, { new: true });

    if (!recipient) {
      return res.status(422).json({ error: "User not found" });
    }

    // Add to sender's sentRequests
    const sender = await User.findByIdAndUpdate(req.user._id, {
      $push: {
        sentRequests: {
          to: req.body.userId,
          status: 'pending'
        }
      }
    }, { new: true }).select("-password");

    res.json(sender);
  } catch (err) {
    return res.status(422).json({ error: err.message });
  }
});

// Accept Friend Request
router.put('/accept-friend-request', requireLogin, async (req, res) => {
  try {
    const requestId = req.body.requestId;

    // Update the request status and add to friends list
    const user = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        'friendRequests._id': requestId
      },
      {
        $set: { 'friendRequests.$.status': 'accepted' },
        $push: { friends: req.body.fromUserId }
      },
      { new: true }
    );

    if (!user) {
      return res.status(422).json({ error: "Friend request not found" });
    }

    // Update sender's sent request status and add to their friends list
    await User.findByIdAndUpdate(
      req.body.fromUserId,
      {
        $set: { 'sentRequests.$[req].status': 'accepted' },
        $push: { friends: req.user._id }
      },
      {
        arrayFilters: [{ 'req.to': req.user._id }],
        new: true
      }
    );

    res.json(user);
  } catch (err) {
    return res.status(422).json({ error: err.message });
  }
});

// Reject Friend Request
router.put('/reject-friend-request', requireLogin, async (req, res) => {
  try {
    const requestId = req.body.requestId;

    // Update the request status
    const user = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        'friendRequests._id': requestId
      },
      {
        $set: { 'friendRequests.$.status': 'rejected' }
      },
      { new: true }
    );

    if (!user) {
      return res.status(422).json({ error: "Friend request not found" });
    }

    // Update sender's sent request status
    await User.findByIdAndUpdate(
      req.body.fromUserId,
      {
        $set: { 'sentRequests.$[req].status': 'rejected' }
      },
      {
        arrayFilters: [{ 'req.to': req.user._id }],
        new: true
      }
    );

    res.json(user);
  } catch (err) {
    return res.status(422).json({ error: err.message });
  }
});

// Remove Friend
router.put('/remove-friend', requireLogin, async (req, res) => {
  try {
    // Remove from both users' friends lists
    const user = await User.findByIdAndUpdate(req.user._id, {
      $pull: { friends: req.body.friendId }
    }, { new: true });

    await User.findByIdAndUpdate(req.body.friendId, {
      $pull: { friends: req.user._id }
    });

    res.json(user);
  } catch (err) {
    return res.status(422).json({ error: err.message });
  }
});

// Update Profile Picture (unchanged)
router.put("/updatepic", requireLogin, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
      $set: { pic: req.body.pic }
    }, { new: true });

    res.json(updatedUser);
  } catch (err) {
    res.status(422).json({ error: "Some error occurred" });
  }
});

// Search Users (unchanged)
router.post("/search-users", async (req, res) => {
  try {
    const userPattern = new RegExp('^' + req.body.query);
    const users = await User.find({ name: { $regex: userPattern, $options: 'i' } }).select("_id name pic");
    return res.json({ user: users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Get Friend Requests
router.get("/friend-requests", requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('friendRequests')
      .populate('friendRequests.from', '_id name pic');

    res.json(user.friendRequests);
  } catch (err) {
    return res.status(422).json({ error: err.message });
  }
});

// Get Friend Recommendations
router.get("/friend-recommendations", requireLogin, async (req, res) => {
  try {
    // Get the current user's friends and requests
    const currentUser = await User.findById(req.user._id)
      .select('friends friendRequests sentRequests')
      .populate('friends', '_id');

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prepare exclusion list
    const existingFriends = currentUser.friends.map(friend => friend._id.toString());

    // Exclude only pending requests (ignore rejected ones)
    const pendingSentRequests = currentUser.sentRequests
      .filter(request => request.status === "pending")
      .map(request => request.to.toString());
    const pendingReceivedRequests = currentUser.friendRequests
      .filter(request => request.status === "pending")
      .map(request => request.from.toString());

    const excludeIds = [...existingFriends, ...pendingSentRequests, ...pendingReceivedRequests, req.user._id];

    // Find mutual friends
    const mutualFriends = await User.aggregate([
      // Match current user's friends
      {
        $match: {
          _id: { $in: currentUser.friends.map(friend => friend._id) }
        }
      },
      // Lookup their friends
      {
        $lookup: {
          from: 'users',
          localField: 'friends',
          foreignField: '_id',
          as: 'mutualFriends'
        }
      },
      // Unwind the mutual friends array
      { $unwind: '$mutualFriends' },
      // Filter out excluded IDs
      {
        $match: {
          'mutualFriends._id': { $nin: excludeIds.map(id => new mongoose.Types.ObjectId(id)) }
        }
      },
      // Group by mutual friend and count occurrences
      {
        $group: {
          _id: '$mutualFriends._id',
          user: { $first: '$mutualFriends' },
          mutualCount: { $sum: 1 }
        }
      },
      // Sort by mutual friend count in descending order
      { $sort: { mutualCount: -1 } },
      // Limit results to 10 recommendations
      { $limit: 10 },
      // Project only necessary fields
      {
        $project: {
          _id: '$user._id',
          name: '$user.name',
          pic: '$user.pic',
          mutualCount: 1
        }
      }
    ]);

    res.json(mutualFriends);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred while fetching recommendations" });
  }
});


// Get Mutual Friends
router.get("/mutual-friends/:userId", requireLogin, async (req, res) => {
  try {
    // Get current user's friends
    const currentUser = await User.findById(req.user._id)
      .select('friends')
      .populate('friends', '_id name pic');

    // Get target user's friends
    const targetUser = await User.findById(req.params.userId)
      .select('friends')
      .populate('friends', '_id name pic');

    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find mutual friends
    const currentUserFriends = currentUser.friends.map(f => f._id.toString());
    const mutualFriends = targetUser.friends
      .filter(f => currentUserFriends.includes(f._id.toString()));

    res.json(mutualFriends);
  } catch (err) {
    return res.status(422).json({ error: err.message });
  }
});

module.exports = router;