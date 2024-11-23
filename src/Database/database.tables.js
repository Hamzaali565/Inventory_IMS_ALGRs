import { createItem } from "../Model/item.model.js";
import { unitTable } from "../Model/unit.model.js";
import { query } from "./database.config.js";

const tablesSetup = async () => {
  try {
    await query(createItem);
    await query(unitTable);
    console.log("table created successfully !!!");
  } catch (error) {
    console.log(`Table creration failed with ${error}`);
    throw error;
  }
};

export { tablesSetup };
