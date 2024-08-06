"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPosts = exports.getFollowingPosts = exports.getLikedPosts = exports.getAllPosts = exports.likeUnlikePost = exports.commentPost = exports.deletePost = exports.createPost = void 0;
const post_model_1 = __importDefault(require("../models/post.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const cloudinary_1 = require("cloudinary");
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the text and img from request body
        const { text } = req.body;
        let { img } = req.body;
        // Get the current user id
        const userId = req.user._id;
        // Check if the user exists
        const user = yield user_model_1.default.findById(userId).select("-password");
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
            const uploadedResponse = yield cloudinary_1.v2.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }
        // Create a new post
        const newPost = new post_model_1.default({
            user: userId,
            text,
            img,
        });
        // Save the new post
        yield newPost.save();
        res.status(201).json(newPost);
    }
    catch (err) {
        console.log(`Error in createPost controller : ${err.message}`);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.createPost = createPost;
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Get post from request params
        const postId = req.params.id;
        const post = yield post_model_1.default.findById(postId);
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
            const imgId = ((_a = post.img.split("/").pop()) === null || _a === void 0 ? void 0 : _a.split(".")[0]) || "";
            yield cloudinary_1.v2.uploader.destroy(imgId);
        }
        // Delete the post
        yield post_model_1.default.findByIdAndDelete(postId);
        return res.status(201).json({ message: "Post deleted succesfully" });
    }
    catch (err) {
        console.log(`Error in deletePost controller : ${err.message}`);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.deletePost = deletePost;
const commentPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the text from request body
        const { text } = req.body;
        // Get the post id from request params
        const postId = req.params.postId;
        const post = yield post_model_1.default.findById(postId);
        // Get the current user id
        const userId = req.user._id;
        // Check if there is a text
        if (!text)
            return res.status(401).json({ error: "Text field is required" });
        // Check if there is ap post
        if (!post)
            return res.status(404).json({ error: "Post not found" });
        // Add new comment
        const comment = { user: userId, text };
        post.comments.push(comment);
        yield post.save();
        res.status(201).json(post);
    }
    catch (err) {
        console.log(`Error in commentPost controller : ${err.message}`);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.commentPost = commentPost;
const likeUnlikePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the current user id
        const userId = req.user._id;
        // Get the post from reques params
        const postId = req.params.postId;
        const post = yield post_model_1.default.findById(postId);
        // Check if there is a post
        if (!post)
            return res.status(404).json({ error: "Post not found" });
        // Check if the user already like the post
        const userLikedPost = post.likes.includes(userId);
        if (userLikedPost) {
            // Unlike post
            yield post_model_1.default.updateOne({ _id: postId }, { $pull: { likes: userId } });
            yield user_model_1.default.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
            const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
            res.status(200).json(updatedLikes);
        }
        else {
            //Like post
            post.likes.push(userId);
            yield post.save();
            yield user_model_1.default.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
            // Add notification to the user who get the post liked
            const notification = new notification_model_1.default({
                from: userId,
                to: post.user,
                type: "like",
            });
            yield notification.save();
            const updatedLikes = post.likes;
            return res.status(200).json(post.likes);
        }
    }
    catch (err) {
        console.log(`Error in likeUnlikePost controller : ${err.message}`);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.likeUnlikePost = likeUnlikePost;
const getAllPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get all the posts sorted from the latest from createdAt field
        const posts = yield post_model_1.default.find()
            .sort({ createdAt: -1 })
            .populate({ path: "user", select: "-password -email" })
            .populate({ path: "comments.user", select: "-password -email" });
        // If there is no post in database
        if (posts.length === 0) {
            return res.status(200).json([]);
        }
        return res.status(200).json(posts);
    }
    catch (err) {
        console.log(`Error in getAllPosts controller : ${err.message}`);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.getAllPosts = getAllPosts;
const getLikedPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //Get user from params
        const userId = req.params.id;
        const user = yield user_model_1.default.findById(userId);
        // Check if there is a user
        if (!user)
            return res.status(404).json({ error: "User not found" });
        // Get liked post by the user
        const likedPosts = yield post_model_1.default.find({
            _id: { $in: user.likedPosts },
        })
            .populate({ path: "user", select: "-password -email" }) // Populate the tweet's user
            .populate({ path: "comments.user", select: "-password -email" }); // Populate the tweet' comement's user
        return res.status(200).json(likedPosts);
    }
    catch (err) {
        console.log(`Error in getLikedPosts controller : ${err.message}`);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.getLikedPosts = getLikedPosts;
const getFollowingPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get current user
        const userId = req.user._id;
        const user = yield user_model_1.default.findById(userId);
        // Check if the user exists
        if (!user)
            return res.status(404).json({ error: "User not found" });
        // Get the following posts array, sort from the latest and populate it by the user
        const following = user.following;
        const followingPosts = yield post_model_1.default.find({ user: { $in: following } })
            .sort({ createdAt: -1 })
            .populate({ path: "user", select: "-password -email" })
            .populate({ path: "comments.user", select: "-password -email" });
        return res.status(200).json(followingPosts);
    }
    catch (err) {
        console.log(`Error in getFollowingPosts controller : ${err.message}`);
        return res.status(500).json({ error: "Internas server error" });
    }
});
exports.getFollowingPosts = getFollowingPosts;
const getUserPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get user from the params
        const { username } = req.params;
        const user = yield user_model_1.default.findOne({ username });
        // Check if the user exists
        if (!user)
            return res.status(404).json({ error: "User not found" });
        // Get the posts of the user, sort it from the latest, and populate it by the user
        const userPosts = yield post_model_1.default.find({ user: user._id })
            .sort({ createdAt: -1 })
            .populate({ path: "user", select: "-password -email" })
            .populate({ path: "comments.user", select: "-password -email" });
        return res.status(200).json(userPosts);
    }
    catch (err) {
        console.log(`Error in getUserPosts : ${err.message}`);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.getUserPosts = getUserPosts;
