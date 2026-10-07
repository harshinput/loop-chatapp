import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { exportChatMedia, hasImageKitConfig } from "../lib/imagekit.js";
import { getReceiverSocketId } from "../lib/socket.js";

export const getAllUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-clerkId");

    res.status(200).json({ users: filteredUsers });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllChats = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const conversations = await Message.aggregate([
      // Match messages where the logged-in user is either the sender or receiver
      {
        $match: {
          $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
        },
      },

      // Group messages by the other participant's ID and get the latest message timestamp
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", loggedInUserId] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessageAt: { $max: "$createdAt" },
        },
      },

      //   Sort the conversations by the latest message timestamp in descending order
      { $sort: { lastMessageAt: -1 } },

      //   Lookup the user details for the other participant in each conversation{}
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },

      //   Replace the root of each document with the first user object from the lookup result
      { $replaceRoot: { newRoot: { $first: "$user" } } },

      //   Project the user details, excluding the clerkId field
      { $project: { clerkId: 0 } },
    ]);

    res.status(200).json({ chats: conversations });
  } catch (error) {
    console.error("Error fetching chats:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatById = async (req, res) => {
  try {
    const { id } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: id },
        { senderId: id, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching chat by ID:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;

    let imageUrl;
    let videoUrl;

    if (req.file) {
      if (!hasImageKitConfig) {
        return res
          .status(500)
          .json({ error: "Media upload is not configured" });
      }

      const url = await exportChatMedia(req.file);
      if (req.file.mimetype.startsWith("video/")) videoUrl = url;
      else imageUrl = url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      video: videoUrl,
    });

    await newMessage.save();

    // socket.io code
    const receiverSocketId = getReceiverSocketId(receiverId);
    // only send the message to the receiver if they are online
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
