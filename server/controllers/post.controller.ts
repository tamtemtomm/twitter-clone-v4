import { Request, Response } from "express";
import Post from "../models/post.model";
import User from "../models/user.model";
import Notification from "../models/notification.model";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req: any, res: Response) => {
  try {
    // Get the text and img from request body
    const { text } = req.body;
    let { img } = req.body;

    // Get the current user id
    const userId = req.user._id;

    // Check if the user exists
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if there is a text or img
    if (!text && !img) {
      return res
        .status(400)
        .json({ error: "Post must have a text or a image" });
    }

    // Upload img to cloudinary if there is a img
    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    // Create a new post
    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    // Save the new post
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err: any) {
    console.log(`Error in createPost controller : ${err.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deletePost = async (req: any, res: Response) => {
  try {
    // Get post from request params
    const postId = req.params.id;
    const post = await Post.findById(postId);

    // Check if there is a post
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if the post is the current user's post
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "You are not authorized to delete this post" });
    }

    // if post has a image, we destroy it from cloudinary
    if (post.img) {
      const imgId = post.img.split("/").pop()?.split(".")[0] || "";
      await cloudinary.uploader.destroy(imgId);
    }

    // Delete the post
    await Post.findByIdAndDelete(postId);
    return res.status(201).json({ message: "Post deleted succesfully" });
  } catch (err: any) {
    console.log(`Error in deletePost controller : ${err.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const commentPost = async (req: any, res: Response) => {
  try {
    // Get the text from request body
    const { text } = req.body;

    // Get the post id from request params
    const postId = req.params.postId;
    const post = await Post.findById(postId);

    // Get the current user id
    const userId = req.user._id;

    // Check if there is a text
    if (!text) return res.status(401).json({ error: "Text field is required" });

    // Check if there is ap post
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Add new comment
    const comment = { user: userId, text };
    post.comments.push(comment);
    await post.save();
    res.status(201).json(post);
  } catch (err: any) {
    console.log(`Error in commentPost controller : ${err.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const likeUnlikePost = async (req: any, res: Response) => {
  try {
    // Get the current user id
    const userId = req.user._id;

    // Get the post from reques params
    const postId = req.params.postId;
    const post = await Post.findById(postId);

    // Check if there is a post
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Check if the user already like the post
    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      // Unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );

      res.status(200).json(updatedLikes);
    } else {
      //Like post
      post.likes.push(userId);
      await post.save();

      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      // Add notification to the user who get the post liked
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();

      const updatedLikes = post.likes;
      return res.status(200).json(post.likes);
    }
  } catch (err: any) {
    console.log(`Error in likeUnlikePost controller : ${err.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllPosts = async (req: any, res: Response) => {
  try {
    // Get all the posts sorted from the latest from createdAt field
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password -email" })
      .populate({ path: "comments.user", select: "-password -email" });

    // If there is no post in database
    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(posts);
  } catch (err: any) {
    console.log(`Error in getAllPosts controller : ${err.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getLikedPosts = async (req: any, res: Response) => {
  try {
    //Get user from params
    const userId = req.params.id;
    const user = await User.findById(userId);

    // Check if there is a user
    if (!user) return res.status(404).json({ error: "User not found" });

    // Get liked post by the user
    const likedPosts = await Post.find({
      _id: { $in: user.likedPosts },
    })
      .populate({ path: "user", select: "-password -email" }) // Populate the tweet's user
      .populate({ path: "comments.user", select: "-password -email" }); // Populate the tweet' comement's user

    return res.status(200).json(likedPosts);
  } catch (err: any) {
    console.log(`Error in getLikedPosts controller : ${err.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getFollowingPosts = async (req: any, res: Response) => {
  try {
    // Get current user
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) return res.status(404).json({ error: "User not found" });

    // Get the following posts array, sort from the latest and populate it by the user
    const following = user.following;
    const followingPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password -email" })
      .populate({ path: "comments.user", select: "-password -email" });

    return res.status(200).json(followingPosts);
  } catch (err: any) {
    console.log(`Error in getFollowingPosts controller : ${err.message}`);
    return res.status(500).json({ error: "Internas server error" });
  }
};

export const getUserPosts = async (req: any, res: Response) => {
  try {
    // Get user from the params
    const { username } = req.params;
    const user = await User.findOne({ username });

    // Check if the user exists
    if (!user) return res.status(404).json({ error: "User not found" });

    // Get the posts of the user, sort it from the latest, and populate it by the user
    const userPosts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password -email" })
      .populate({ path: "comments.user", select: "-password -email" });

    return res.status(200).json(userPosts);
  } catch (err: any) {
    console.log(`Error in getUserPosts : ${err.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};
