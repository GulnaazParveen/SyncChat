import { Router } from "express"
const router=Router();

import { getMessage, sendMessage } from "../controllers/messages.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
router.route("/sendmessage/:id").post(verifyJWT,sendMessage)
router.route("/getmessage/:id").get(verifyJWT,getMessage)

export default router