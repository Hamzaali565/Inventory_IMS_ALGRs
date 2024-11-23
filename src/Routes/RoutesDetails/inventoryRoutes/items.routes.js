import { Router } from "express";
import { createItem } from "../../../Controllers/inventory/item.controller.js";
import {
  create_unit,
  get_unfiltered_units,
} from "../../../Controllers/inventory/unit.controller.js";

const router = Router();
//items
router.route("/item").post(createItem);

//units
router.route("/unit").post(create_unit);
router.route("/unit").get(get_unfiltered_units);

export default router;
