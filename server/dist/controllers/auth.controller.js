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
exports.getMe = exports.logout = exports.login = exports.signup = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateToken_1 = require("../lib/utils/generateToken");
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const existingUser = yield user_model_1.default.findOne({ username: username });
        if (existingUser) {
            return res.status(400).json({ error: "Username is already taken" });
        }
        // Check if there is an existing email
        const existingEmail = yield user_model_1.default.findOne({ email: email });
        if (existingEmail) {
            return res.status(400).json({ error: "Email is already taken" });
        }
        if (password.length < 6) {
            return res
                .status(400)
                .json({ error: "Password must be at least 6 characters long" });
        }
        // Hashed the password
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        // Make new user object
        const newUser = new user_model_1.default({
            username,
            fullName,
            email,
            password: hashedPassword,
        });
        if (newUser) {
            // Generate cookie to authenticate
            (0, generateToken_1.generateTokenAndSetCookie)(newUser._id, res);
            // Save new user to db
            yield newUser.save();
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
        }
        else {
            res.status(400).json({ error: "Invalid user data" });
        }
    }
    catch (err) {
        console.log("Error in signup controller", err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.signup = signup;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        // Find the user
        const user = yield user_model_1.default.findOne({ username });
        // Check if password is valid
        const isPasswordCorrect = yield bcryptjs_1.default.compare(password, (user === null || user === void 0 ? void 0 : user.password) || "");
        // Return if there is no user or the password is invalid
        if (!user || !isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid username or password" });
        }
        // Set the cookie
        (0, generateToken_1.generateTokenAndSetCookie)(user._id, res);
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
    }
    catch (err) {
        console.log("Error in login controller", err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Remove the cookie
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out succesfully" });
    }
    catch (err) {
        console.log(`Error on logout controllers : ${err.message}`);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.logout = logout;
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findById(req.user._id).select("-password -email");
        res.status(200).json(user);
    }
    catch (err) {
        console.log(`Error on getMe controller : ${err.message}`);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getMe = getMe;
