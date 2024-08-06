import Notification from "../models/notification.model";
import { Request, Response } from "express";

export const getNotifications = async (req: any, res: Response) => {
  try {
    // Get the current user id
    const userId = req.user._id;

    // Get the user's notification, get the username and profileImg for the users
    const userNotification = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });

    // Update the notification read field
    await Notification.updateMany({ to: userId }, { read: true });

    // Return the notification
    return res.status(200).json(userNotification);
  } catch (err: any) {
    console.log(`Error in getNotification controller: ${err.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteNotifications = async (req: any, res: Response) => {
  try {
    // Get the current user id
    const userId = req.user._id;

    // Delete the notification
    await Notification.deleteMany({ to: userId });

    res.status(200).json({ message: "Notifications deleted succesfully" });
  } catch (err: any) {
    console.log(`Error in deleteNotification controller: ${err.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};
