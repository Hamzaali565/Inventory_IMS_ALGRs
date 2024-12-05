import { Router } from "express";
import {
  create_user,
  login_user,
} from "../../../Controllers/Auth/sign.controller.js";

const router = Router();

router.route("/sign-in").post(create_user);
router.route("/login").post(login_user);

export default router;
