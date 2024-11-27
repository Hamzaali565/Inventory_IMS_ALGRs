import { Router } from "express";
import {
  create_po,
  retrieved_detail,
  retrieved_summary,
} from "../../../Controllers/P_order/P_order.controller.js";

const router = Router();
//items
router.route("/purchase_order").post(create_po);
router.route("/purchase_order").get(retrieved_summary);
router.route("/purchase_order_detail").get(retrieved_detail);

export default router;
