import { Router } from "express";
import {
  create_sale_order,
  get_item_to_sale,
} from "../../../Controllers/sales/saleOrder.controller.js";

const router = Router();

router.route("/sales").get(get_item_to_sale);
router.route("/sales").post(create_sale_order);

export default router;
