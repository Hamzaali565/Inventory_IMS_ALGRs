import { Router } from "express";
import {
  create_po,
  po_to_grn,
  retrieved_detail,
  retrieved_summary,
  sorted_po,
  update_po,
} from "../../../Controllers/P_order/P_order.controller.js";

const router = Router();
//items
router.route("/purchase_order").post(create_po);
router.route("/purchase_order").get(retrieved_summary);
router.route("/purchase_order_incompleted").get(po_to_grn);
router.route("/purchase_order_sorted").get(sorted_po);
router.route("/purchase_order_detail").get(retrieved_detail);
router.route("/purchase_order").put(update_po);

export default router;
