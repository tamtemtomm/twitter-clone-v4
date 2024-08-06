import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

// configure the cloudinary account
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Import the routes
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import postRoutes from "./routes/post.route";
import notificationRoutes from "./routes/notification.route";

import connectMongoDB from "./db/ConnectMongoDB";

const app = express();
const PORT = process.env.PORT || 5000;
// const __dirname = path.resolve()

// Connect to essential middlewares
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true })); // to parse from ulencoded data
if (process.env.NODE_ENV === "production") {
  app.use(
    cors({
      origin: ["https://twitter-clone-api-sage.vercel.app"],
      methods: ["POST", "GET", "DELETE"],
      credentials: true,
    })
  );
} else {
  app.use(cors({}));
}

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.json("Hello");
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongoDB();
});
