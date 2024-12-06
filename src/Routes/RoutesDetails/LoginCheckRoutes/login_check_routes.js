import { Router } from "express";
import { login_check } from "../../../Controllers/login_check/product.login.check.js";

const router = Router();

router.route("/login-check").get(login_check);

export default router;
