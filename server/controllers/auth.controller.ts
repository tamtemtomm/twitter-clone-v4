import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken";

export const signup = async (req: Request, res: Response) => {
  try {
    // Get data from req body
    const { fullName, username, email, password } = req.body;

    // console.log(fullName, username, email, password)
    // Validate email using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid Email Format" });
    }

    // Check if there is an existing username
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    // Check if there is an existing email
    const existingEmail = await User.findOne({ email: email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    // Hashed the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Make new user object
    const newUser = new User({
      username,
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // Generate cookie to authenticate
      generateTokenAndSetCookie(newUser._id, res);

      // Save new user to db
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (err: any) {
    console.log("Error in signup controller", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Find the user
    const user = await User.findOne({ username });

    // Check if password is valid
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    // Return if there is no user or the password is invalid
    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    // Set the cookie
    generateTokenAndSetCookie(user._id, res);

    // Return the user
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    });
  } catch (err: any) {
    console.log("Error in login controller", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // Remove the cookie
    res.cookie("jwt", "", { maxAge: 0 });

    res.status(200).json({ message: "Logged out succesfully" });
  } catch (err: any) {
    console.log(`Error on logout controllers : ${err.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select("-password -email")
    res.status(200).json(user)
  } catch (err: any) {
    console.log(`Error on getMe controller : ${err.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};
