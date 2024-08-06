import User from "../models/user.model";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"

export const protectRoute = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Parse and get the jwt token
    const token = req.cookies.jwt;

    // Check if there is a token
    if (!token) {
      return res.json(401).json({ error: "Unauthorized: No Token Provided" });
    }

    // Verify the token with JWT secret and check if it's valid
    const decoded : any = jwt.verify(token, process.env.JWT_SECRET || "");
    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized: Invalid Token" });
    }

    // Get the user
    const user = await User.findById(decoded.userId || "").select("-password");

    // Check if the user exist
    if (!user){
        return res.status(404).json({error: "User not found"})
    }

    req.user = user
    next()

  } catch (err) {}
};
