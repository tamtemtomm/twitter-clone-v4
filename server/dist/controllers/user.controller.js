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
exports.updateUserProfile = exports.followUnfollowUser = exports.getSuggestedUser = exports.getUserProfile = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const cloudinary_1 = require("cloudinary");
const user_model_1 = __importDefault(require("../models/user.model"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get username from params
    const { username } = req.params;
    try {
        // Get the user from db
        const user = yield user_model_1.default.findOne({ username }).select("-password");
        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }
        // Return the user
        res.status(200).json(user);
    }
    catch (err) {
        console.log(`"Error in getUserProfile controller : ${err.message}`);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getUserProfile = getUserProfile;
const getSuggestedUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the current user id from middleware
        const userId = req.user._id;
        // Get the user that current user follow
        const userFollowedByMe = yield user_model_1.default.findById(userId).select("following");
        // Get the 10 users
        const users = yield user_model_1.default.aggregate([
            {
                $match: {
                    _id: { $ne: userId },
                },
            },
            { $sample: { size: 10 } },
        ]);
        // Exclude the current user
        const filteredUsers = users.filter((user) => !(userFollowedByMe === null || userFollowedByMe === void 0 ? void 0 : userFollowedByMe.following.includes(user._id)));
        // Get 4 user
        const suggestedUsers = filteredUsers.slice(0, 4);
        // Null the password
        suggestedUsers.forEach((user) => (user.password = null));
        res.status(200).json(suggestedUsers);
    }
    catch (err) {
        console.log(`Error on getSuggestedUsers controller: ${err.message}`);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.getSuggestedUser = getSuggestedUser;
const followUnfollowUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the id from request params
        const { id } = req.params;
        // Get the followed and current user
        const userToModify = yield user_model_1.default.findById(id);
        const currentuser = yield user_model_1.default.findById(req.user._id);
        // Check if they both the same person, if yes then return
        if (id === req.user._id.toString()) {
            return res
                .status(400)
                .json({ error: "You can't follow/unfollow yourself" });
        }
        // Check if they both exists, if not then return
        if (!userToModify || !currentuser) {
            return res.status(400).json({ error: "User not found" });
        }
        // Check if they followed
        const isFollowing = currentuser.following.includes(id);
        if (isFollowing) {
            // Unfollow the user
            // Remove followers on user to modify
            yield user_model_1.default.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            // Remove following on currentUser
            yield user_model_1.default.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
            res.status(200).json({ message: "User unfollowed succesfully" });
        }
        else {
            // Follow the user
            // Add followers on user to modify
            yield user_model_1.default.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            // Add following on currentUser
            yield user_model_1.default.findByIdAndUpdate(req.user._id, { $push: { following: id } });
            // Add new notification
            const newNotification = new notification_model_1.default({
                type: "follow",
                from: req.user._id,
                to: userToModify._id,
            });
            yield newNotification.save();
            // TODO : return the id of the user as as response
            res.status(200).json({ message: "User followed succesfully" });
        }
    }
    catch (err) {
        console.log(`"Error in followUnfollowUser controller : ${err.message}`);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.followUnfollowUser = followUnfollowUser;
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { username, fullName, currentPassword, newPassword, email, bio, link } = req.body;
    let { profileImg, coverImg } = req.body;
    // Get current user id
    const userId = req.user._id;
    try {
        // Get current user
        let user = yield user_model_1.default.findById(userId);
        // Check if user exists
        if (!user)
            return res.status(404).json({ error: "User not found" });
        // Check if there is a new password and current password
        if ((!currentPassword && newPassword) ||
            (!newPassword && currentPassword)) {
            return res.status(400).json({
                error: "Please provide both current password and new password",
            });
        }
        // If there is both current and a new one, it means the user want to change it
        if (currentPassword && newPassword) {
            // Check if the current password match the password in db
            const isMatch = yield bcryptjs_1.default.compare(currentPassword, user.password);
            // if not match, we return
            if (!isMatch)
                return res.status(400).json({ error: "Current password is incorrect" });
            // check in the new password is 6 char
            if (newPassword.length < 6) {
                return res.status(400).json({ error: "Password must be at least 6 characters long" });
            }
            // save the new password, but hashed it first
            const salt = yield bcryptjs_1.default.genSalt(10);
            user.password = yield bcryptjs_1.default.hash(newPassword, salt);
        }
        // Check if profileImg is included
        if (profileImg) {
            // If user already have the profileImg, we would like to destroy it
            if (user.profileImg) {
                yield cloudinary_1.v2.uploader.destroy(((_b = (_a = user.profileImg) === null || _a === void 0 ? void 0 : _a.split("/").pop()) === null || _b === void 0 ? void 0 : _b.split(".")[0]) || "");
            }
            // Upload the img into cloudinary
            const uploadedResponse = yield cloudinary_1.v2.uploader.upload(profileImg);
            // Get the URL
            profileImg = uploadedResponse.secure_url;
        }
        // Check if coverImg is included
        if (coverImg) {
            // If user already have the coverImg, we would like to destroy it
            if (user.coverImg) {
                yield cloudinary_1.v2.uploader.destroy(((_d = (_c = user.coverImg) === null || _c === void 0 ? void 0 : _c.split("/").pop()) === null || _d === void 0 ? void 0 : _d.split(".")[0]) || "");
            }
            // Upload the img into cloudinary
            const uploadedResponse = yield cloudinary_1.v2.uploader.upload(coverImg);
            // Get the URL
            coverImg = uploadedResponse.secure_url;
        }
        // Update the user
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;
        // update the new user into db
        user = yield user.save();
        // Password has to be null in the response
        user.password = "";
        return res.status(200).json(user);
    }
    catch (err) {
        console.log(`Error in updateUserProfile controller: ${err.message}`);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.updateUserProfile = updateUserProfile;
