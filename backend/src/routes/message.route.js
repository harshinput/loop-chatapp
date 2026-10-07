import e from "express";
import {
  getAllChats,
  getAllUsers,
  getChatById,
  sendMessage,
} from "../controllers/message.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = e.Router();

router.use(verifyUser); // Apply the verifyUser middleware to all routes in this router

router.get("/users", getAllUsers);
router.get("/chats", getAllChats);
router.get("/:id", getChatById);
router.post("/send/:id", upload.single("media"), sendMessage);

export default router;
