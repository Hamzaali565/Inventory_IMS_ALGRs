import { Router } from "express";
import {
  create_payment,
  create_payment_invoice,
  create_supplier,
  get_supplier_payment,
  payment_false_grn,
  payment_false_invoice,
  retrieved_supplier,
  return_lp_items_to_supplier,
  supplier_ledger,
  update_supplier,
} from "../../../Controllers/supplier/supplier.controller.js";

const router = Router();
//items
router.route("/supplier").post(create_supplier);
router.route("/supplier").get(retrieved_supplier);
router.route("/supplier").put(update_supplier);
router.route("/supplier-ledger").get(supplier_ledger);
router.route("/false-payment").get(payment_false_grn);
router.route("/payment_false_invoice").get(payment_false_invoice);
router.route("/supplier-payment").post(create_payment);
router.route("/create_payment_invoice").post(create_payment_invoice);
router.route("/return_lp_items_to_supplier").post(return_lp_items_to_supplier);
router.route("/supplier-payment-record").get(get_supplier_payment);

export default router;
