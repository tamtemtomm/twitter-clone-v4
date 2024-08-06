import jwt from "jsonwebtoken";
import { Response } from "express";

export const generateTokenAndSetCookie = (userId: any, res: Response) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || "", {
    expiresIn: "15d",
  });

  res.cookie("jwt", token, {
    maxAge: 15*24*60*60*1000, // in miliseconds
    httpOnly: true, //prevent xss attacks cross-site scripting attacks
    sameSite: "strict", //CSRF attacks cross-site request forgery attacks
    secure: process.env.NODE_ENV !== "development"
  })
};
