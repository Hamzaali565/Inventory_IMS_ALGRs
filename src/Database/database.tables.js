import { category_model } from "../Model/category.model.js";
import { createItem } from "../Model/item.model.js";
import { location_modal } from "../Model/location.model.js";
import { child_PO_modal, master_PO_modal } from "../Model/pur_order.modal.js";
import { stock_taking_model } from "../Model/stockTaking.model.js";
import { supplier_model } from "../Model/supplier.model.js";
import { unitTable } from "../Model/unit.model.js";
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
    console.log("table created successfully !!!");
  } catch (error) {
    console.log(`Table creration failed with ${error}`);
    throw error;
  }
};

export { tablesSetup };
