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
exports.deleteNotifications = exports.getNotifications = void 0;
const notification_model_1 = __importDefault(require("../models/notification.model"));
const getNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the current user id
        const userId = req.user._id;
        // Get the user's notification, get the username and profileImg for the users
        const userNotification = yield notification_model_1.default.find({ to: userId }).populate({
            path: "from",
            select: "username profileImg",
        });
        // Update the notification read field
        yield notification_model_1.default.updateMany({ to: userId }, { read: true });
        // Return the notification
        return res.status(200).json(userNotification);
    }
    catch (err) {
        console.log(`Error in getNotification controller: ${err.message}`);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.getNotifications = getNotifications;
const deleteNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the current user id
        const userId = req.user._id;
        // Delete the notification
        yield notification_model_1.default.deleteMany({ to: userId });
        res.status(200).json({ message: "Notifications deleted succesfully" });
    }
    catch (err) {
        console.log(`Error in deleteNotification controller: ${err.message}`);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.deleteNotifications = deleteNotifications;
