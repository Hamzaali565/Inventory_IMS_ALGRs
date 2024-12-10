import { Router } from "express";
import {
  create_multiple_items,
  createItem,
  item_name_partial,
  retrieved_item,
  update_item,
} from "../../../Controllers/inventory/item.controller.js";
import {
  create_unit,
  get_unfiltered_units,
  update_unit,
} from "../../../Controllers/inventory/unit.controller.js";
import {
  create_category,
  retrieved_category,
  update_category,
} from "../../../Controllers/inventory/category.controller.js";
import {
  create_location,
  retrieved_location,
  update_location,
} from "../../../Controllers/inventory/location.controller.js";
import {
  current_stock,
  previous_stock,
  stock_upload,
} from "../../../Controllers/inventory/StockTaking.controller.js";
import { create_grn } from "../../../Controllers/inventory/grn.controller.js";

const router = Router();
//items
router.route("/item").post(createItem);
router.route("/item").get(retrieved_item);
router.route("/item-partial").get(item_name_partial);
router.route("/item").put(update_item);
router.route("/upload-excel").post(create_multiple_items);

//units
router.route("/unit").post(create_unit);
router.route("/unit").get(get_unfiltered_units);
router.route("/unit").put(update_unit);

//category
router.route("/category").post(create_category);
router.route("/category").get(retrieved_category);
router.route("/category").put(update_category);

// location
router.route("/location").post(create_location);
router.route("/location").get(retrieved_location);
router.route("/location").put(update_location);

// stock
router.route("/stock").post(stock_upload);
router.route("/stock").get(current_stock);
router.route("/p-stock").get(previous_stock);

// grn
router.route("/grn").post(create_grn);

export default router;
