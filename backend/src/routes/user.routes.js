import { Router } from "express";
const router = Router();

import { upload } from "../middlewares/multer.middleware.js";
import { getAllLoggedUser, individualLoggedUser, loginUser,refreshAccessToken,registerUser } from "../controllers/user.controller.js";
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
router.route("/getusers").get(getAllLoggedUser)
router.route("/refreshtoken").post(refreshAccessToken);
router.route("/me").get(verifyJWT,individualLoggedUser)
export default router