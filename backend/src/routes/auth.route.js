import e from "express";
import { checkAuth } from "../controllers/auth.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const router = e.Router();

router.get("/check", verifyUser, checkAuth);

export default router;
