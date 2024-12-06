import { Router } from "express";
import {
  create_user,
  login_user,
  logout_user,
} from "../../../Controllers/Auth/sign.controller.js";

const router = Router();

router.route("/sign-in").post(create_user);
router.route("/login").post(login_user);
router.route("/logout").post(logout_user);

export default router;
