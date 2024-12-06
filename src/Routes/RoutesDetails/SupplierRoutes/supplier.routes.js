import { Router } from "express";
import {
  create_supplier,
  payment_false_grn,
  retrieved_supplier,
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

export default router;
