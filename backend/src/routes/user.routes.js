import { Router } from "express";
const router = Router();

import { upload } from "../middlewares/multer.middleware.js";
import {
  getAllLoggedUser,
  individualLoggedUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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
router.route("/getusers").get(verifyJWT, getAllLoggedUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refreshtoken").post(refreshAccessToken);
router.route("/me").get(verifyJWT, individualLoggedUser);

export default router;
