import { Router } from "express";
import { create_po } from "../../../Controllers/P_order/P_order.controller.js";

const router = Router();
//items
router.route("/purchase_order").post(create_po);

export default router;
