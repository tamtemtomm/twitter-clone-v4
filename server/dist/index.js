"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// configure the cloudinary account
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Import the routes
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const post_route_1 = __importDefault(require("./routes/post.route"));
const notification_route_1 = __importDefault(require("./routes/notification.route"));
const ConnectMongoDB_1 = __importDefault(require("./db/ConnectMongoDB"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// const __dirname = path.resolve()
// Connect to essential middlewares
app.use(express_1.default.json({ limit: "5mb" }));
app.use(express_1.default.urlencoded({ extended: true })); // to parse from ulencoded data
app.use((0, cors_1.default)({}));
app.use((0, cookie_parser_1.default)());
app.use("/api/auth", auth_route_1.default);
app.use("/api/users", user_route_1.default);
app.use("/api/posts", post_route_1.default);
app.use("/api/notifications", notification_route_1.default);
// if(process.env.NODE_ENV === "production"){
//   app.use(express.static(path.join(__dirname, "..","..","client", "dist")))
//   app.get("*", (req, res) => {res.sendFile(path.resolve(__dirname,"..","..","client", "dist", "index.html"))})
// }
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    (0, ConnectMongoDB_1.default)();
});
