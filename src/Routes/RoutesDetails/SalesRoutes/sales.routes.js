import { Router } from "express";
import {
  create_clearance,
  create_sale_order,
  credit_customers,
  credit_for_clearance,
  get_item_to_sale,
} from "../../../Controllers/sales/saleOrder.controller.js";

const router = Router();

router.route("/sales").get(get_item_to_sale);
router.route("/sales").post(create_sale_order);
router.route("/credit-costumers").get(credit_customers);
router.route("/credit_for_clearance").get(credit_for_clearance);
router.route("/create_clearance").post(create_clearance);

export default router;
