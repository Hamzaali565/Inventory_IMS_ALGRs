import { category_model } from "../Model/category.model.js";
import { GRN_modal, master_GRN_modal } from "../Model/grn.model.js";
import {
  child_invoice,
  invoice_clearance,
  master_invoice,
} from "../Model/invoice_model.js";
import { createItem } from "../Model/item.model.js";
import { local_purchasing } from "../Model/local_purchasing.model.js";
import { location_modal } from "../Model/location.model.js";
import { child_PO_modal, master_PO_modal } from "../Model/pur_order.modal.js";
import {
  previous_stock,
  stock_taking_model,
} from "../Model/stockTaking.model.js";
import {
  supplier_ledger_model,
  supplier_model,
  supplier_payment_model,
} from "../Model/supplier.model.js";
import { unitTable } from "../Model/unit.model.js";
import { user_model } from "../Model/user.model.js";
import { query } from "./database.config.js";

const tablesSetup = async () => {
  try {
    await query(createItem);
    await query(unitTable);
    await query(category_model);
    await query(location_modal);
    await query(stock_taking_model);
    await query(supplier_model);
    await query(master_PO_modal);
    await query(child_PO_modal);
    await query(GRN_modal);
    await query(master_GRN_modal);
    await query(supplier_ledger_model);
    await query(previous_stock);
    await query(local_purchasing);
    await query(master_invoice);
    await query(child_invoice);
    await query(user_model);
    await query(supplier_payment_model);
    await query(invoice_clearance);
    console.log("table created successfully !!!");
  } catch (error) {
    console.log(`Table creration failed with ${error}`);
    throw error;
  }
};

export { tablesSetup };
