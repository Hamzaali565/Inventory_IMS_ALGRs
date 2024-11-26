import { category_model } from "../Model/category.model.js";
import { createItem } from "../Model/item.model.js";
import { location_modal } from "../Model/location.model.js";
import { stock_taking_model } from "../Model/stockTaking.model.js";
import { unitTable } from "../Model/unit.model.js";
import { query } from "./database.config.js";

const tablesSetup = async () => {
  try {
    await query(createItem);
    await query(unitTable);
    await query(category_model);
    await query(location_modal);
    await query(stock_taking_model);
    console.log("table created successfully !!!");
  } catch (error) {
    console.log(`Table creration failed with ${error}`);
    throw error;
  }
};

export { tablesSetup };
