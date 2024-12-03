import { Router } from "express";
import { get_item_to_sale } from "../../../Controllers/sales/saleOrder.controller.js";

const router = Router();

router.route("/sales").get(get_item_to_sale);

export default router;
