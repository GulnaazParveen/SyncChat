import { Router } from "express";
const router = Router();

import { upload } from "../middlewares/multer.middleware.js";
import { getAllLoggedUser, loginUser,registerUser } from "../controllers/user.controller.js";
router.route("/registerUser").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      file: "assets",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);
router.route("/getusers").get(getAllLoggedUser)
export default router