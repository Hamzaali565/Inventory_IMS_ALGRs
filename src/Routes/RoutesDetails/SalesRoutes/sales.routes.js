import { Router } from "express";
import {
  create_clearance,
  create_sale_order,
  create_supp_ledger_of_lp,
  credit_customers,
  credit_for_clearance,
  get_item_to_sale,
  get_lp_detail,
  get_lp_invoices,
  stock_recieve_against_refund,
} from "../../../Controllers/sales/saleOrder.controller.js";

const router = Router();

router.route("/sales").get(get_item_to_sale);
router.route("/sales").post(create_sale_order);
router.route("/credit-costumers").get(credit_customers);
router.route("/credit_for_clearance").get(credit_for_clearance);
router.route("/create_clearance").post(create_clearance);
router.route("/lp-invoices").get(get_lp_invoices);
router.route("/lp-detail").get(get_lp_detail);
router.route("/create_supp_ledger_of_lp").post(create_supp_ledger_of_lp);
router
  .route("/stock_recieve_against_refund")
  .post(stock_recieve_against_refund);

export default router;
