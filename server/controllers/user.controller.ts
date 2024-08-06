import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

import User from "../models/user.model";
import Notification from "../models/notification.model";

export const getUserProfile = async (req: Request, res: Response) => {
  // Get username from params
  const { username } = req.params;

  try {
    // Get the user from db
    const user = await User.findOne({ username }).select("-password");

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    // Return the user
    res.status(200).json(user);
  } catch (err: any) {
    console.log(`"Error in getUserProfile controller : ${err.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSuggestedUser = async (req: any, res: Response) => {
  try {
    // Get the current user id from middleware
    const userId = req.user._id;

    // Get the user that current user follow
    const userFollowedByMe = await User.findById(userId).select("following");

    // Get the 10 users
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);

    // Exclude the current user
    const filteredUsers = users.filter(
      (user) => !userFollowedByMe?.following.includes(user._id)
    );

    // Get 4 user
    const suggestedUsers = filteredUsers.slice(0, 4);

    // Null the password
    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (err: any) {
    console.log(`Error on getSuggestedUsers controller: ${err.message}`)
    return res.status(500).json({error: "Internal server error"})
  }
};

export const followUnfollowUser = async (req: any, res: Response) => {
  try {
    // Get the id from request params
    const { id } = req.params;

    // Get the followed and current user
    const userToModify = await User.findById(id);
    const currentuser = await User.findById(req.user._id);

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
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      // Remove following on currentUser
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

      res.status(200).json({ message: "User unfollowed succesfully" });
    } else {
      // Follow the user
      // Add followers on user to modify
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      // Add following on currentUser
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

      // Add new notification
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });

      await newNotification.save();

      // TODO : return the id of the user as as response
      res.status(200).json({ message: "User followed succesfully" });
    }
  } catch (err: any) {
    console.log(`"Error in followUnfollowUser controller : ${err.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUserProfile = async (req: any, res: Response) => {
  const { username, fullName, currentPassword, newPassword, email, bio, link } =
    req.body;
  let { profileImg, coverImg } = req.body;

  // Get current user id
  const userId = req.user._id;

  try {
    // Get current user
    let user = await User.findById(userId);

    // Check if user exists
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if there is a new password and current password
    if (
      (!currentPassword && newPassword) ||
      (!newPassword && currentPassword)
    ) {
      return res.status(400).json({
        error: "Please provide both current password and new password",
      });
    }

    // If there is both current and a new one, it means the user want to change it
    if (currentPassword && newPassword) {

      // Check if the current password match the password in db
			const isMatch = await bcrypt.compare(currentPassword, user.password);

      // if not match, we return
			if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });

      // check in the new password is 6 char
			if (newPassword.length < 6) {
				return res.status(400).json({ error: "Password must be at least 6 characters long" });
			}

      // save the new password, but hashed it first
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt);
		}

    // Check if profileImg is included
    if (profileImg) {
      // If user already have the profileImg, we would like to destroy it
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg?.split("/").pop()?.split(".")[0] || ""
        );
      }

      // Upload the img into cloudinary
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);

      // Get the URL
      profileImg = uploadedResponse.secure_url;
    }

    // Check if coverImg is included
    if (coverImg) {
      // If user already have the coverImg, we would like to destroy it
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg?.split("/").pop()?.split(".")[0] || ""
        );
      }

      // Upload the img into cloudinary
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);

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
    user = await user.save();

    // Password has to be null in the response
    user.password = "";

    return res.status(200).json(user);
  } catch (err: any) {
    console.log(`Error in updateUserProfile controller: ${err.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};
