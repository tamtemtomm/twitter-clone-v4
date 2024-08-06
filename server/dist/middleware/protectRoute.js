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
exports.protectRoute = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const protectRoute = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Parse and get the jwt token
        const token = req.cookies.jwt;
        // Check if there is a token
        if (!token) {
            return res.json(401).json({ error: "Unauthorized: No Token Provided" });
        }
        // Verify the token with JWT secret and check if it's valid
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "");
        if (!decoded) {
            return res.status(401).json({ error: "Unauthorized: Invalid Token" });
        }
        // Get the user
        const user = yield user_model_1.default.findById(decoded.userId || "").select("-password");
        // Check if the user exist
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        req.user = user;
        next();
    }
    catch (err) { }
});
exports.protectRoute = protectRoute;
