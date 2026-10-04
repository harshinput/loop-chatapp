import e from "express";
import { checkAuth } from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = e.Router();

router.get("/check", protectRoute, checkAuth);
// router.post("/register", registerController);
// router.post("/logout", logoutController);

export default router;
